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
    res.locals.filename = req.file.filename;
    return next();
  });
};
// Create new Content:
module.exports.createContent = async (req, res, next) => {
  const { contentCaption, contentBody } = req.body;
  try {
    // create a new Content with an empty contentImageUrl
    let newContent = new ContentsModel({
      contentCaption: contentCaption,
      contentBody: contentBody,
    });
    let result = await newContent.save();
    // create folder for image content
    const contentId = result._id;
    const contentPathCreated = await createPath(contentsDefaultDir, contentId);
    // move file from temp dir to main dir
    const filename = res.locals.filename;
    const src = contentsTempDir + filename;
    const dest = contentsDefaultDir + contentId + "/" + filename;
    await fse.move(src, dest);
    console.log("success!");
    // completed
    return res.status(200).json({
      code: 1,
      folderPath: contentPathCreated,
    });
    // upload image
    // update image url
  } catch (error) {
    return next(createError(500, error.message));
  }
};
