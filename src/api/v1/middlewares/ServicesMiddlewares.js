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
module.exports.uploadCreateService = (req, res, next) => {
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
      return res.status(400).json({
        code: 0,
        success: false,
        error: "File Not Found To Upload!",
      });
    }
    res.locals.filename = req.file.filename;
    res.locals.path = req.file.path;
    return next();
  });
};
// Create Services:
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
    let newService = new ServicesModel({
      serviceName: serviceName,
      Contents: matchedObjectId,
    });
    const createdService = await newService.save();
    // create folder to store image
    await createPath(servicesDefaultDir, createdService._id);
    // move image from tempDir to mainDir
    const src = servicesTempDir + res.locals.filename;
    const dest =
      servicesDefaultDir + createdService._id + "/" + res.locals.filename;
    await fse.move(src, dest);
    // update path for delete file, must be located here after moving file
    res.locals.path = dest;
    // upload image to cloudinary
    const cloudinaryUploadResult = await cloudinaryUploader(dest);
    if (!cloudinaryUploadResult.success) {
      return next(createError(500, cloudinaryUploadResult.message));
    }
    // update image url
    createdService.serviceBannerUrl = cloudinaryUploadResult.result.url;
    const result = await createdService.save();
    // completed
    return res.status(200).json({
      code: 1,
      success: true,
      message: "Service Created!",
      data: result,
    });
  } catch (error) {
    return next(createError(500, error.message));
  } finally {
    // delete image from system
    const filepath = res.locals.path;
    fse.removeSync(filepath);
  }
};
// Get All Services:
module.exports.getAllServices = async (req, res, next) => {
  try {
    const allServices = await ServicesModel.find({}).populate("Contents");
    return res.status(200).json({
      code: 1,
      success: true,
      counter: allServices.length,
      message: "All Services",
      data: allServices,
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
// Update Service By Id (do not update image): allow add and remove content
module.exports.updateServiceById = async (req, res, next) => {
  const { serviceId } = req.params;
  const { serviceName, Contents } = req.body;
  try {
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
    // update serviceExist
    serviceExist.serviceName = serviceName || serviceExist.serviceName;
    serviceExist.Contents = matchedObjectId;
    // update to database
    let result = await serviceExist.save();
    // completed
    return res.status(200).json({
      code: 1,
      success: true,
      message: `Updated ${serviceId}!`,
      data: result,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
//
module.exports.deleteServiceById = async (req, res, next) => {
  const { serviceId } = req.params;
  try {
    const serviceExist = await ServicesModel.findById(serviceId);
    if (!serviceExist)
      return next(createError(404, `ServiceId ${serviceId} Not Found!`));
    
    // delete database
    // delete cloudinary
    // delete folder
  } catch (error) {
    return next(createError(500, error.message));
  }
};
