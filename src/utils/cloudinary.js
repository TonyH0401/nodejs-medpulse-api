require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const fse = require("fs-extra");
const path = require("path");
// Cloudinary Config:
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});
// CLoudinary Uploader:
async function cloudinaryUploader(filePath) {
  try {
    const result = await cloudinary.uploader.upload(filePath);
    if (!result) {
      fse.unlinkSync(filePath);
      return {
        success: false,
        message: "Cloudinary Error when Upload!",
      };
    }
    return {
      success: true,
      message: "Uploaded to Cloudinary!",
      result: result,
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
}
// function cloudinaryDestroy()
// Exports:
module.exports = { cloudinaryUploader };
