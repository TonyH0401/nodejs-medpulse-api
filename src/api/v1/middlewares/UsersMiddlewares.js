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
const AccountsModel = require("../models/AccountsModels");
// Upload File to tempDir for Creating User using Multer:
const upload = multer({
  storage: fileStorage(usersTempDir),
  fileFilter: imageOnlyFileFilter,
  limits: fileSize5mb,
}).single("avatarImageUrl");
module.exports.uploadCreateUser = (req, res, next) => {
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
// Create User then Create Account:
module.exports.createUserAccount = async (req, res, next) => {
  const {
    fullName,
    emailAddress,
    phoneNumber,
    homeAddress,
  } = req.body;
  try {
    // create new User
    let newUser = await UsersModel({
      fullName: fullName,
      emailAddress: emailAddress,
      phoneNumber: phoneNumber,
      homeAddress: homeAddress,
    });
    let createdUser = await newUser.save();
    // create mainDir to store image
    await createPath(usersDefaultDir, createdUser._id);
    // move image from tempDir to mainDir
    const src = usersTempDir + res.locals.filename;
    const dest = usersDefaultDir + createdUser._id + "/" + res.locals.filename;
    await fse.move(src, dest);
    // update path for delete file, must be located here after moving file
    res.locals.path = dest;
    // upload image to cloudinary
    const cloudinaryUploadResult = await cloudinaryUploader(dest);
    if (!cloudinaryUploadResult.success) {
      return next(createError(500, cloudinaryUploadResult.message));
    }
    // update image url
    createdUser.avatarImageUrl = cloudinaryUploadResult.result.url;
    const result = await createdUser.save();
    // completed
    return res.status(200).json({
      code: 1,
      success: true,
      message: "User Account Created!",
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
    const allUsers = await UsersModel.find({});
    return res.status(200).json({
      code: 1,
      success: true,
      message: "All Users!",
      counter: allUsers.length,
      data: allUsers,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Update User Information By Id:
module.exports.updateUserById = async (req, res, next) => {
  const { userId } = req.params;
  const { fullName, emailAddress, phoneNumber, homeAddress } = req.body;
  try {
    let userExist = await UsersModel.findById(userId);
    if (!userExist)
      return next(createError(404, `UserId ${userId} Not Found!`));
    userExist.fullName = fullName || userExist.fullName;
    userExist.emailAddress = emailAddress || userExist.emailAddress;
    userExist.phoneNumber = phoneNumber || userExist.phoneNumber;
    userExist.homeAddress = homeAddress || userExist.homeAddress;
    const updatedResult = await userExist.save();
    return res.status(200).json({
      code: 1,
      success: true,
      message: `Updated UserId ${userId}!`,
      data: userExist,
    });
  } catch (error) {
    return next(createError(500));
  }
};
// Update User Image By Id:
module.exports.updateUserImageById = async (req, res, next) => {
  const { userId } = req.params;
  try {
    let userExist = await UsersModel.findById(userId);
    if (!userExist) {
      // delete file from tempDir if userId is not found
      fse.removeSync(res.locals.path);
      return next(createError(404, `UserId ${userId} Not Found!`));
    }
    // move image from tempDir to mainDir
    const src = usersTempDir + res.locals.filename;
    const dest = usersDefaultDir + userExist._id + "/" + res.locals.filename;
    await fse.move(src, dest);
    // update path for delete file, must be located here after moving file
    res.locals.path = dest;
    // upload image to cloudinary
    const cloudinaryUploadResult = await cloudinaryUploader(dest);
    if (!cloudinaryUploadResult.success) {
      return next(createError(500, cloudinaryUploadResult.message));
    }
    // delete old image in cloudinary
    const imagePublicUrl = userExist.avatarImageUrl;
    if (imagePublicUrl) {
      let urlPart = imagePublicUrl.split("/");
      let publicId = urlPart[urlPart.length - 1].split(".")[0];
      const cloudDeleteion = await cloudinaryDestroy(publicId);
      if (!cloudDeleteion.success) {
        return next(createError(500, cloudDeleteion.message));
      }
    }
    // update new image url
    userExist.avatarImageUrl = cloudinaryUploadResult.result.url;
    const updatedResult = await userExist.save();
    // completed
    return res.status(200).json({
      code: 1,
      success: true,
      message: `Updated Image for UserId ${userId}`,
      data: updatedResult,
    });
  } catch (error) {
    return next(createError(500, error.message));
  } finally {
    // delete file from system
    const filepath = res.locals.path;
    fse.removeSync(filepath);
  }
};
// Delete User By Id:
module.exports.deleteUserById = async (req, res, next) => {
  const { userId } = req.params;
  try {
    let userExist = await UsersModel.findById(userId);
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
      // delete folder
      const filepath = usersDefaultDir + userId;
      fse.removeSync(filepath);
      // completed
      return res.status(200).json({
        code: 1,
        success: true,
        message: `Deleted UserId ${userId}!`,
        data: userDeleted,
      });
    }
  } catch (error) {
    return next(createError(500, error.message));
  } finally {
  }
};
