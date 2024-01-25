const createError = require("http-errors");
const multer = require("multer");
const fse = require("fs-extra");
const path = require("path");
// Custom Utils:
const contentsDefaultDir = "./src/public/ContentsImages/";
const contentsTempDir = "./src/public/ContentsImagesTemp/";
const {
  fileStorage,
  imageOnlyFileFilter,
  fileSize5mb,
} = require("../../../utils/multerOptions");
const { isPathExist, createPath } = require("../../../utils/fileHandling");
const {
  cloudinaryUploader,
  cloudinaryDestroy,
} = require("../../../utils/cloudinary");
// Custom Middlewares:
// Import Models:
const ContentsModel = require("../models/ContentsModel");
// Check if the text of Content is Empty:
module.exports.isContentInputEmpty = (req, res, next) => {
  //   console.log(req.body);
  const { contentCaption, contentBody } = req.body;
  if (!contentCaption)
    return next(createError(400, "contentCaption field is empty!"));
  if (!contentBody)
    return next(createError(400, "contentBody field is empty!"));
  return next();
};
// Multer Upload File for Creating Contents:
// define upload with custom properties
const upload = multer({
  storage: fileStorage(contentsTempDir),
  fileFilter: imageOnlyFileFilter,
  limits: fileSize5mb,
}).single("contentImageUrl");
module.exports.createContentsFileMulter = (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(404).json({ error: err.message });
    } else if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({
        code: 0,
        success: false,
        error: "There is no file to upload!",
      });
    }
    res.locals.filename = req.file.filename;
    return next();
  });
};
// Create New Content:
module.exports.createContent = async (req, res, next) => {
  const { contentCaption, contentBody } = req.body;
  try {
    // create a new Content with an empty contentImageUrl
    let newContent = new ContentsModel({
      contentCaption: contentCaption,
      contentBody: contentBody,
    });
    let contentCreated = await newContent.save();
    // create folder for image content
    const contentId = contentCreated._id;
    const contentPathCreated = await createPath(contentsDefaultDir, contentId);
    // move file from temp dir to main dir
    const filename = res.locals.filename;
    const src = contentsTempDir + filename;
    const dest = contentsDefaultDir + contentId + "/" + filename;
    await fse.move(src, dest);
    // upload image to cloudinary
    const filePath = dest;
    // create filename to delete filename from system, probably move up, next to dest
    res.locals.filePath = dest;
    const cloudinaryResult = await cloudinaryUploader(filePath);
    if (!cloudinaryResult.success) {
      return next(createError(500, cloudinaryResult.message));
    }
    // update imageUrl to database
    contentCreated.contentImageUrl = cloudinaryResult.result.url;
    const result = await contentCreated.save();
    // completed
    return res.status(200).json({
      code: 1,
      success: true,
      message: "New Content Created!",
      data: result,
    });
  } catch (error) {
    return next(createError(500, error.message));
  } finally {
    // delete file from system
    const filePath = res.locals.filePath;
    fse.removeSync(filePath);
  }
};
// Get All Contents:
module.exports.getAllContents = async (req, res, next) => {
  try {
    const allContents = await ContentsModel.find({});
    return res.status(200).json({
      code: 1,
      success: true,
      message: "List of all Contents!",
      total: allContents.length,
      data: allContents,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Get Content by Id:
module.exports.getContentById = async (req, res, next) => {
  const { contentId } = req.params;
  try {
    const contentExist = await ContentsModel.findById(contentId);
    if (!contentExist)
      return next(createError(404, `ContentId: ${contentId} Not Found!`));
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
      return next(createError(404, `Content Id ${contentId} Not Found!`));
    // delete in database
    const result = await ContentsModel.findByIdAndDelete(contentId);
    // get Cloudinary public id if there is imagePublicUrl
    const imagePublicUrl = contentExisted.contentImageUrl;
    if (imagePublicUrl) {
      let urlPart = imagePublicUrl.split("/");
      let publicId = urlPart[urlPart.length - 1].split(".")[0];
      // delete in cloudinary if there is imagePublicUrl
      const cloudDeleteion = await cloudinaryDestroy(publicId);
      if (!cloudDeleteion.success) {
        return next(createError(500, cloudDeleteion.message));
      }
    }
    // delete folder
    const filePath = contentsDefaultDir + contentId;
    fse.removeSync(filePath);
    // delete service referencing content is found in contentmodel trigger
    return res.status(200).json({
      code: 1,
      success: true,
      message: `ContentId ${contentId} Deleted!`,
      data: result,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Update Content By Id (Text Only):
module.exports.editContentById = async (req, res, next) => {
  const { contentId } = req.params;
  const { contentCaption, contentBody } = req.body;
  try {
    let contentExist = await ContentsModel.findById(contentId);
    if (!contentExist)
      return next(createError(404, `ContentId ${contentId} Not Found!`));
    contentExist.contentCaption = contentCaption || contentExist.contentCaption;
    contentExist.contentBody = contentBody || contentExist.contentBody;
    const result = await contentExist.save();
    return res.status(200).json({
      code: 1,
      success: false,
      message: `ContentId ${contentId} Edited!`,
      data: result,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Update Content Image By Id:
module.exports.editContentImgById = async (req, res, next) => {
  const { contentId } = req.params;
  try {
    // upload file to tempDir using multer
    // find content
    let contentExist = await ContentsModel.findById(contentId);
    if (!contentExist) {
      // remove file from tempDir if content is not found
      let fileName = res.locals.filename;
      let filePath = contentsTempDir + fileName;
      fse.removeSync(filePath);
      return next(createError(404, `ContentId ${contentId} Not Found!`));
    }
    // move file from tempDir to mainDir
    const filename = res.locals.filename;
    const src = contentsTempDir + filename;
    const dest = contentsDefaultDir + contentId + "/" + filename;
    await fse.move(src, dest);
    // create filepath in res.locals to delete file from system later
    res.locals.filepath = dest;
    // upload new image to cloudinary
    const cloudinaryResult = await cloudinaryUploader(dest);
    if (!cloudinaryResult.success) {
      return next(createError(500, cloudinaryResult.message));
    }
    // destroy old image on cloudinary
    const imagePublicUrl = contentExist.contentImageUrl;
    if (imagePublicUrl) {
      let urlPart = imagePublicUrl.split("/");
      let publicId = urlPart[urlPart.length - 1].split(".")[0];
      const cloudDeleteion = await cloudinaryDestroy(publicId);
      if (!cloudDeleteion.success) {
        return next(createError(500, cloudDeleteion.message));
      }
    }
    // update new imageUrl to database
    contentExist.contentImageUrl = cloudinaryResult.result.url;
    const result = await contentExist.save();
    return res.status(200).json({
      code: 1,
      success: true,
      message: `New Image ${contentId} Updated!`,
      data: result,
    });
  } catch (error) {
    return next(createError(500, error.message));
  } finally {
    // delete file from system
    const filepath = res.locals.filepath;
    fse.removeSync(filepath);
  }
};
