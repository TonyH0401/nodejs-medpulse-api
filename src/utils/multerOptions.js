const multer = require("multer");
const fse = require("fs-extra");
const path = require("path");
// Custom Utils:
const { isPathExist, createPath } = require("./fileHandling");
// Define Storages:
function fileStorage(destinationDir) {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      const dest = destinationDir;
      // check if temp path exist, if not create it
      fse.ensureDirSync(dest);
      cb(null, dest);
    },
    filename: function (req, file, cb) {
      const ext = "." + file.mimetype.split("/")[1];
      const uniqueSuffix =
        file.fieldname +
        "-" +
        Date.now() +
        "-" +
        Math.round(Math.random() * 1e9) +
        ext;
      cb(null, uniqueSuffix);
    },
  });
}
// Define File Filters:
const imageOnlyFileFilter = function (req, file, callback) {
  var ext = path.extname(file.originalname);
  if (ext !== ".png" && ext !== ".jpg" && ext !== ".gif" && ext !== ".jpeg") {
    return callback(new Error("Only images are allowed"));
  }
  callback(null, true);
};
// Define File Sizes:
const fileSize5mb = {
  fileSize: 1 * 1024 * 1024,
};
// Exports:
module.exports = { fileStorage, imageOnlyFileFilter, fileSize5mb };
