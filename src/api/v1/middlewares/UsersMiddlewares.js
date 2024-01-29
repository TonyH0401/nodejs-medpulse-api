const createError = require("http-errors");
const multer = require("multer");
const fse = require("fs-extra");
const path = require("path");
// Custom Utils:
const usersDefaultDir = "./src/public/UsersImages/";
const usersTempDir = "./src/public/UsersImagesTemp/";
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
const UsersModel = require("../models/UsersModel");
// Upload File to tempDir for Creating User using Multer:
const upload = multer({
  storage: fileStorage(usersTempDir),
  fileFilter: imageOnlyFileFilter,
  limits: fileSize5mb,
}).single("avatarImageUrl");
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
// Create User:
module.exports.createUser = async (req, res, next) => {
  const { fullName, emailAddress, phoneNumber, homeAddress } = req.body;
  try {
    // create new User
    let userNew = await UsersModel({
      fullName: fullName || "",
      emailAddress: emailAddress || "",
      phoneNumber: phoneNumber || "",
      homeAddress: homeAddress || "",
    });
    let userCreated = await userNew.save();
    // create mainDir to store image
    await createPath(usersDefaultDir, userCreated._id);
    // check if upload file exist
    if (res.locals.fileExist) {
      // move image from tempDir to mainDir
      const src = usersTempDir + res.locals.filename;
      const dest =
        usersDefaultDir + userCreated._id + "/" + res.locals.filename;
      await fse.move(src, dest);
      // update path for delete file, must be located here after moving file
      res.locals.path = dest;
      // upload image to cloudinary
      const cloudinaryUploadResult = await cloudinaryUploader(dest);
      if (!cloudinaryUploadResult.success) {
        return next(createError(500, cloudinaryUploadResult.message));
      }
      // update image url to database
      userCreated.avatarImageUrl = cloudinaryUploadResult.result.url;
      await userCreated.save();
    }
    // completed
    return res.status(200).json({
      code: 1,
      success: true,
      message: "User Created!",
      data: userCreated,
    });
  } catch (error) {
    return next(createError(500, error.message));
  } finally {
    // delete file from system
    if (res.locals.fileExist) fse.removeSync(res.locals.path);
  }
};
// Get User By Id:
module.exports.getUserById = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const userExist = await UsersModel.findById(userId);
    if (!userExist)
      return next(createError(404, `UserId ${userId} Not Found!`));
    return res.status(200).json({
      code: 1,
      success: true,
      message: `UserId ${userId} Found!`,
      data: userExist,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Get All Users:
module.exports.getAllUsers = async (req, res, next) => {
  try {
    const userAll = await UsersModel.find({});
    return res.status(200).json({
      code: 1,
      success: true,
      message: "All Users!",
      counter: userAll.length,
      data: userAll,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Update User By Id:
module.exports.updateUserById = async (req, res, next) => {
  const { userId } = req.params;
  const { fullName, emailAddress, phoneNumber, homeAddress } = req.body;
  try {
    // check if user exist
    let userExist = await UsersModel.findById(userId);
    if (!userExist)
      return next(createError(404, `UserId ${userId} Not Found!`));
    // update user information
    userExist.fullName = fullName || userExist.fullName;
    userExist.emailAddress = emailAddress || userExist.emailAddress;
    userExist.phoneNumber = phoneNumber || userExist.phoneNumber;
    userExist.homeAddress = homeAddress || userExist.homeAddress;
    let userUpdated = await userExist.save();
    // check if upload file exist
    if (res.locals.fileExist) {
      // move file from tempDir to mainDir
      const src = usersTempDir + res.locals.filename;
      const dest = usersDefaultDir + userExist._id + "/" + res.locals.filename;
      await fse.move(src, dest);
      // update path for delete file, must be located here after moving file
      res.locals.path = dest;
      // upload file to cloudinary
      const cloudinaryUploadResult = await cloudinaryUploader(dest);
      if (!cloudinaryUploadResult.success) {
        return next(createError(500, cloudinaryUploadResult.message));
      }
      // delete old file in cloudinary
      const imagePublicUrl = userExist.avatarImageUrl;
      if (imagePublicUrl) {
        let urlPart = imagePublicUrl.split("/");
        let publicId = urlPart[urlPart.length - 1].split(".")[0];
        const cloudDeleteion = await cloudinaryDestroy(publicId);
        if (!cloudDeleteion.success) {
          return next(createError(500, cloudDeleteion.message));
        }
      }
      // update new file url to database
      userUpdated.avatarImageUrl = cloudinaryUploadResult.result.url;
      await userUpdated.save();
    }
    return res.status(200).json({
      code: 1,
      success: true,
      message: `Updated UserId ${userId}!`,
      data: userUpdated,
    });
  } catch (error) {
    return next(createError(500));
  } finally {
    // delete file from system
    if (res.locals.fileExist) fse.removeSync(res.locals.path);
  }
};
// Delete User By Id:
module.exports.deleteUserById = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const userExist = await UsersModel.findById(userId);
    if (!userExist)
      return next(createError(404, `UserId ${userId} Not Found!`));
    // delete in database
    const userDeleted = await UsersModel.findByIdAndDelete(userId);
    // delete in cloudinary
    const imagePublicUrl = userExist.avatarImageUrl;
    if (imagePublicUrl) {
      let urlPart = imagePublicUrl.split("/");
      let publicId = urlPart[urlPart.length - 1].split(".")[0];
      const cloudDeleteion = await cloudinaryDestroy(publicId);
      if (!cloudDeleteion.success) {
        return next(createError(500, cloudDeleteion.message));
      }
    }
    // delete in system
    const filepath = usersDefaultDir + userId;
    fse.removeSync(filepath);
    // i could add deleting reference in account, maybe
    // completed
    return res.status(200).json({
      code: 1,
      success: true,
      message: `Deleted UserId ${userId}!`,
      data: userDeleted,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
