const createError = require("http-errors");
const multer = require("multer");
const fse = require("fs-extra");
const path = require("path");
// Custom Utils:
const servicesDefaultDir = "./src/public/ServicesImages/";
const servicesTempDir = "./src/public/ServicesImagesTemp/";
const {
  cloudinaryUploader,
  cloudinaryDestroy,
} = require("../../../utils/cloudinary");
const {
  fileStorage,
  imageOnlyFileFilter,
  fileSize5mb,
} = require("../../../utils/multerOptions");
const { createPath } = require("../../../utils/fileHandling");
// Custom Middlewares:
// Import Models:
const ServicesModel = require("../models/ServicesModel");
const ContentsModel = require("../models/ContentsModel");
// Upload File to tempDir for Creating Service using Multer:
const upload = multer({
  storage: fileStorage(servicesTempDir),
  fileFilter: imageOnlyFileFilter,
  limits: fileSize5mb,
}).single("serviceBannerUrl");
module.exports.uploadFileMulter = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res
        .status(404)
        .json({ code: 0, success: false, error: err.message });
    } else if (err) {
      return res
        .status(500)
        .json({ code: 0, success: false, error: err.message });
    }
    if (!req.file) {
      res.locals.fileExist = false;
    } else {
      res.locals.fileExist = true;
      res.locals.filename = req.file.filename;
      res.locals.path = req.file.path;
    }
    return next();
  });
};
// Create Service:
module.exports.createService = async (req, res, next) => {
  const { serviceName, Contents } = req.body;
  try {
    // convert Contents parameter into an array, emtpy if undefined
    const arrayIds = !Contents
      ? []
      : Array.isArray(Contents)
      ? [...Contents]
      : [Contents];
    // find all objectId in ContentsModel that matched Contents
    const allContents = await ContentsModel.find({});
    const matchedObjectId = allContents.filter((obj) =>
      arrayIds.includes(obj.id)
    );
    // create new Service
    let serviceNew = new ServicesModel({
      serviceName: serviceName || "",
      serviceBannerUrl: "",
      Contents: matchedObjectId,
    });
    let serviceCreated = await serviceNew.save();
    // create folder to store image
    await createPath(servicesDefaultDir, serviceCreated._id);
    // check if upload file exist
    if (res.locals.fileExist) {
      // move image from tempDir to mainDir
      const src = servicesTempDir + res.locals.filename;
      const dest =
        servicesDefaultDir + serviceCreated._id + "/" + res.locals.filename;
      await fse.move(src, dest);
      // update path for delete file, must be located here after moving file
      res.locals.path = dest;
      // upload image to cloudinary
      const cloudinaryUploadResult = await cloudinaryUploader(dest);
      if (!cloudinaryUploadResult.success) {
        return next(createError(500, cloudinaryUploadResult.message));
      }
      // update image url
      serviceCreated.serviceBannerUrl = cloudinaryUploadResult.result.url;
      await serviceCreated.save();
    }
    // completed
    return res.status(200).json({
      code: 1,
      success: true,
      message: "Service Created!",
      data: serviceCreated,
    });
  } catch (error) {
    return next(createError(500, error.message));
  } finally {
    // delete image from system
    if (res.locals.fileExist) fse.removeSync(res.locals.path);
  }
};
// Get All Services:
module.exports.getAllServices = async (req, res, next) => {
  try {
    const serviceAll = await ServicesModel.find({}).populate("Contents");
    return res.status(200).json({
      code: 1,
      success: true,
      counter: serviceAll.length,
      message: "All Services!",
      data: serviceAll,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Get Service By Id:
module.exports.getServiceById = async (req, res, next) => {
  const { serviceId } = req.params;
  try {
    const serviceExist = await ServicesModel.findById(serviceId).populate(
      "Contents"
    );
    if (!serviceExist)
      return next(createError(404, `ServiceId ${serviceId} Not Found!`));
    return res.status(200).json({
      code: 1,
      success: true,
      message: `ServiceId ${serviceId} Found!`,
      data: serviceExist,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Update Service By Id: should allow add and remove content
module.exports.updateServiceById = async (req, res, next) => {
  const { serviceId } = req.params;
  const { serviceName, Contents } = req.body;
  try {
    // check if service exist
    let serviceExist = await ServicesModel.findById(serviceId);
    if (!serviceExist)
      return next(createError(404, `ServiceId ${serviceId} Not Found!`));
    // convert Contents parameter into an array, array emtpy if undefined
    const arrayIds = !Contents
      ? []
      : Array.isArray(Contents)
      ? [...Contents]
      : [Contents];
    // find all objectId in ContentsModel that matched Contents
    const allContents = await ContentsModel.find({});
    const matchedObjectId = allContents.filter((obj) =>
      arrayIds.includes(obj.id)
    );
    // update service to database
    serviceExist.serviceName = serviceName || serviceExist.serviceName;
    serviceExist.Contents = matchedObjectId;
    let serviceUpdated = await serviceExist.save();
    // check if upload file exist
    if (res.locals.fileExist) {
      // move image from tempDir to mainDir
      const src = servicesTempDir + res.locals.filename;
      const dest =
        servicesDefaultDir + serviceExist._id + "/" + res.locals.filename;
      await fse.move(src, dest);
      // update path for delete file, must be located here after moving file
      res.locals.path = dest;
      // upload image to cloudinary
      const cloudinaryUploadResult = await cloudinaryUploader(dest);
      if (!cloudinaryUploadResult.success) {
        return next(createError(500, cloudinaryUploadResult.message));
      }
      // delete old image in cloudinary
      const imagePublicUrl = serviceExist.serviceBannerUrl;
      if (imagePublicUrl) {
        let urlPart = imagePublicUrl.split("/");
        let publicId = urlPart[urlPart.length - 1].split(".")[0];
        const cloudDeleteion = await cloudinaryDestroy(publicId);
        if (!cloudDeleteion.success) {
          return next(createError(500, cloudDeleteion.message));
        }
      }
      // update new image url
      serviceUpdated.serviceBannerUrl = cloudinaryUploadResult.result.url;
      await serviceUpdated.save();
    }
    // completed
    return res.status(200).json({
      code: 1,
      success: true,
      message: `Updated ServiceId ${serviceId}!`,
      data: serviceUpdated,
    });
  } catch (error) {
    return next(createError(500, error.message));
  } finally {
    // delete file from system
    if (res.locals.fileExist) fse.removeSync(res.locals.path);
  }
};
// Delete Service By Id (this do not delete content because 1 content can be part of multiple service):
module.exports.deleteServiceById = async (req, res, next) => {
  const { serviceId } = req.params;
  try {
    const serviceExist = await ServicesModel.findById(serviceId);
    if (!serviceExist)
      return next(createError(404, `ServiceId ${serviceId} Not Found!`));
    // delete database
    const serviceDeleted = await ServicesModel.findByIdAndDelete(serviceId);
    // delete in cloudinary
    const imagePublicUrl = serviceExist.serviceBannerUrl;
    if (imagePublicUrl) {
      let urlPart = imagePublicUrl.split("/");
      let publicId = urlPart[urlPart.length - 1].split(".")[0];
      const cloudDeleteion = await cloudinaryDestroy(publicId);
      if (!cloudDeleteion.success) {
        return next(createError(500, cloudDeleteion.message));
      }
    }
    // delete serviceId folder
    const filepath = servicesDefaultDir + serviceId;
    fse.removeSync(filepath);
    // completed
    return res.status(200).json({
      code: 1,
      success: true,
      message: `Deleted ServiceId ${serviceId}!`,
      data: serviceDeleted,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
