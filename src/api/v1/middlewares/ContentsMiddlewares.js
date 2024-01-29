const createError = require("http-errors");
const multer = require("multer");
const fse = require("fs-extra");
const path = require("path");
// Content System Directory:
const contentsDefaultDir = "./src/public/ContentsImages/";
const contentsTempDir = "./src/public/ContentsImagesTemp/";
// Custom Utils:
const {
  fileStorage,
  imageOnlyFileFilter,
  fileSize5mb,
} = require("../../../utils/multerOptions");
const { createPath } = require("../../../utils/fileHandling");
const {
  cloudinaryUploader,
  cloudinaryDestroy,
} = require("../../../utils/cloudinary");
// Custom Middlewares:
// Import Models:
const ContentsModel = require("../models/ContentsModel");
// Upload File using Multerfor Create Content:
// define upload using multer with custom properties
const upload = multer({
  storage: fileStorage(contentsTempDir),
  fileFilter: imageOnlyFileFilter,
  limits: fileSize5mb,
}).single("contentImageUrl");
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
// Create Content:
module.exports.createContent = async (req, res, next) => {
  const { contentCaption, contentBody } = req.body;
  try {
    // create a new Content with an empty contentImageUrl
    let contentNew = new ContentsModel({
      contentCaption: contentCaption || "",
      contentBody: contentBody || "",
    });
    let contentCreated = await contentNew.save();
    // create folder for image content
    await createPath(contentsDefaultDir, contentCreated._id);
    // check if upload file exist
    if (res.locals.fileExist) {
      // move file from tempDir to mainDir
      const src = contentsTempDir + res.locals.filename;
      const dest =
        contentsDefaultDir + contentCreated._id + "/" + res.locals.filename;
      await fse.move(src, dest);
      // update path for delete file, must be located here after moving file
      res.locals.path = dest;
      // upload image to cloudinary
      const cloudinaryUploadResult = await cloudinaryUploader(dest);
      if (!cloudinaryUploadResult.success) {
        return next(createError(500, cloudinaryUploadResult.message));
      }
      // update imageUrl to database
      contentCreated.contentImageUrl = cloudinaryUploadResult.result.url;
      await contentCreated.save();
    }
    // completed
    return res.status(200).json({
      code: 1,
      success: true,
      message: "Content Created!",
      data: contentCreated,
    });
  } catch (error) {
    return next(createError(500, error.message));
  } finally {
    // delete file from system
    if (res.locals.fileExist) fse.removeSync(res.locals.path);
  }
};
// Get All Contents:
module.exports.getAllContents = async (req, res, next) => {
  try {
    const contentAll = await ContentsModel.find({});
    return res.status(200).json({
      code: 1,
      success: true,
      message: "All Content!",
      counter: contentAll.length,
      data: contentAll,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Get Content By Id:
module.exports.getContentById = async (req, res, next) => {
  const { contentId } = req.params;
  try {
    const contentExist = await ContentsModel.findById(contentId);
    if (!contentExist)
      return next(createError(404, `ContentId ${contentId} Not Found!`));
    return res.status(200).json({
      code: 1,
      success: true,
      message: `ContentId ${contentId} Found!`,
      data: contentExist,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Delete Content By Id: should add enable property, avoid deletion
module.exports.deleteContentById = async (req, res, next) => {
  const { contentId } = req.params;
  try {
    const contentExisted = await ContentsModel.findById(contentId);
    if (!contentExisted)
      return next(createError(404, `ContentId ${contentId} Not Found!`));
    // delete in database
    const contentDeleted = await ContentsModel.findByIdAndDelete(contentId);
    // delete in cloudinary
    const imagePublicUrl = contentExisted.contentImageUrl;
    if (imagePublicUrl) {
      let urlPart = imagePublicUrl.split("/");
      let publicId = urlPart[urlPart.length - 1].split(".")[0];
      const cloudDeleteion = await cloudinaryDestroy(publicId);
      if (!cloudDeleteion.success) {
        return next(createError(500, cloudDeleteion.message));
      }
    }
    // delete folder in system
    const filePath = contentsDefaultDir + contentId;
    fse.removeSync(filePath);
    // delete service referencing content is found in contentmodel trigger
    // completed
    return res.status(200).json({
      code: 1,
      success: true,
      message: `Deleted ContentId ${contentId}!`,
      data: contentDeleted,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Update Content By Id:
module.exports.updateContentById = async (req, res, next) => {
  const { contentId } = req.params;
  const { contentCaption, contentBody } = req.body;
  try {
    let contentExist = await ContentsModel.findById(contentId);
    if (!contentExist) {
      // remove file from tempDir if content is not found
      if (res.locals.fileExist) fse.removeSync(res.locals.path);
      return next(createError(404, `ContentId ${contentId} Not Found!`));
    }
    contentExist.contentCaption = contentCaption || contentExist.contentCaption;
    contentExist.contentBody = contentBody || contentExist.contentBody;
    let contentUpdated = await contentExist.save();
    // check if upload file exist
    if (res.locals.fileExist) {
      // move file from tempDir to mainDir
      const src = contentsTempDir + res.locals.filename;
      const dest =
        contentsDefaultDir + contentExist._id + "/" + res.locals.filename;
      await fse.move(src, dest);
      // update path for delete file, must be located here after moving file
      res.locals.path = dest;
      // upload image to cloudinary
      const cloudinaryUploadResult = await cloudinaryUploader(dest);
      if (!cloudinaryUploadResult.success) {
        if (res.locals.fileExist) fse.removeSync(res.locals.path);
        return next(createError(500, cloudinaryUploadResult.message));
      }
      // destroy old image on cloudinary
      const imagePublicUrl = contentExist.contentImageUrl;
      if (imagePublicUrl) {
        let urlPart = imagePublicUrl.split("/");
        let publicId = urlPart[urlPart.length - 1].split(".")[0];
        const cloudDeleteion = await cloudinaryDestroy(publicId);
        if (!cloudDeleteion.success) {
          if (res.locals.fileExist) fse.removeSync(res.locals.path);
          return next(createError(500, cloudDeleteion.message));
        }
      }
      // update imageUrl to database
      contentUpdated.contentImageUrl = cloudinaryUploadResult.result.url;
      await contentUpdated.save();
    }
    // completed
    return res.status(200).json({
      code: 1,
      success: true,
      message: `Updated ContentId ${contentId}!`,
      data: contentUpdated,
    });
  } catch (error) {
    return next(createError(500, error.message));
  } finally {
    // delete file from system
    if (res.locals.fileExist) fse.removeSync(res.locals.path);
  }
};
