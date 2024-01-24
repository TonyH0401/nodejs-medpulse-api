const fse = require("fs-extra");
// Check if Path to ContentId Exist:
module.exports.isPathExist = async (defaultPath, contentId) => {
  const contentPath = defaultPath + contentId;
  const pathExist = await fse.pathExists(contentPath);
  if (!pathExist) return false;
  return true;
};
// Create a ContentId Path:
module.exports.createPath = async (defaultPath, contentId) => {
  const contentPath = defaultPath + contentId;
  const result = await fse.ensureDir(contentPath);
  return result;
};
