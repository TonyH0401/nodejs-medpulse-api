const createError = require("http-errors");
const multer = require("multer");
const fse = require("fs-extra");
const path = require("path");
// Custom Utils:
const postsDefaultDir = "./src/public/Posts/";
const postsTempDir = "./src/public/PostsTemp/";
const { fileStorage } = require("../../../utils/multerOptions");
const { createPath } = require("../../../utils/fileHandling");
const {
  cloudinaryUploader,
  cloudinaryDestroy,
} = require("../../../utils/cloudinary");
// Custom Middlewares:
// Import Models:
const PostsModel = require("../models/PostsModel");
const UsersModel = require("../models/UsersModel");
// Multer Upload File for Creating Contents:
// define upload with custom properties
const upload = multer({
  storage: fileStorage(postsTempDir),
}).single("attachedFiles");
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
// Create Post:
module.exports.createPost = async (req, res, next) => {
  const { postTitle, postSubTitle, postBody, postAuthor } = req.body;
  try {
    // create new Post
    let postNew = new PostsModel({
      postTitle: postTitle || "",
      postSubTitle: postSubTitle || "",
      postBody: postBody || "",
      postAuthor: (await UsersModel.findById(postAuthor)) || null,
      attachedFiles: "",
    });
    let postCreated = await postNew.save();
    // create folder for file
    await createPath(postsDefaultDir, postCreated._id);
    // check if upload file exist
    if (res.locals.fileExist) {
      // move file from temp dir to main dir
      const src = postsTempDir + res.locals.filename;
      const dest =
        postsDefaultDir + postCreated._id + "/" + res.locals.filename;
      await fse.move(src, dest);
      // update path for delete file, must be located here after moving file
      res.locals.path = dest;
      // update file path in database
      postCreated.attachedFiles = dest;
      await postCreated.save();
    }
    // completed
    return res.status(200).json({
      code: 1,
      success: true,
      message: "Post Created!",
      data: postCreated,
    });
  } catch (error) {
    // delete file from system
    if (res.locals.fileExist) fse.removeSync(res.locals.path);
    return next(createError(500, error.message));
  }
};
// Get All Posts:
module.exports.getAllPosts = async (req, res, next) => {
  try {
    const postAll = await PostsModel.find({}).populate("postAuthor");
    return res.status(200).json({
      code: 1,
      success: true,
      message: "All Posts!",
      counter: postAll.length,
      data: postAll,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Get Post by Id:
module.exports.getPostById = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const postExist = await PostsModel.findById(postId).populate("postAuthor");
    if (!postExist)
      return next(createError(404, `PostId: ${postId} Not Found!`));
    return res.status(200).json({
      code: 1,
      success: true,
      message: `PostId ${postId} Found!`,
      data: postExist,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Update Post By Id:
module.exports.updatePostById = async (req, res, next) => {
  const { postId } = req.params;
  const { postTitle, postSubTitle, postBody, postAuthor } = req.body;
  try {
    // check if post exist
    let postExist = await PostsModel.findById(postId);
    // handle if post doesn't exist
    if (!postExist) {
      // if post doesn'texist, delete file in tempDIr
      if (res.locals.fileExist) fse.removeSync(res.locals.path);
      return next(createError(404, `PostId ${postId} Not Found!`));
    }
    // update post
    postExist.postTitle = postTitle || postExist.postTitle;
    postExist.postSubTitle = postSubTitle || postExist.postSubTitle;
    postExist.postBody = postBody || postExist.postBody;
    postExist.postAuthor =
      (await UsersModel.findById(postAuthor)) || postExist.postAuthor;
    await postExist.save();
    // check if file is uploaded
    if (res.locals.fileExist) {
      // delete the existed old file
      fse.removeSync(postExist.attachedFiles);
      // move file from temp dir to main dir
      const src = postsTempDir + res.locals.filename;
      const dest = postsDefaultDir + postExist._id + "/" + res.locals.filename;
      await fse.move(src, dest);
      // update path for delete file, must be located here after moving file
      res.locals.path = dest;
      // update file path in database
      postExist.attachedFiles = dest;
      await postExist.save();
    }
    // completed
    const postUpdated = await postExist.populate("postAuthor");
    return res.status(200).json({
      code: 1,
      success: true,
      message: `:PostId ${postId} Edited!`,
      data: postUpdated,
    });
  } catch (error) {
    if (res.locals.fileExist) fse.removeSync(res.locals.path);
    return next(createError(500, error.message));
  }
};
// Delete Post By Id:
module.exports.deletePostById = async (req, res, next) => {
  const { postId } = req.params;
  try {
    const postExist = await PostsModel.findById(postId);
    if (!postExist)
      return next(createError(404, `PostId ${postId} Not Found!`));
    // delete in database
    const deletedPost = await PostsModel.findByIdAndDelete(postId);
    // delete folder
    fse.removeSync(postsDefaultDir + postId);
    // completed
    return res.status(200).json({
      code: 1,
      success: true,
      message: `Deleted PostId ${postId}!`,
      data: deletedPost,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
