const sanitizeHtml = require("sanitize-html");
// Custom Utils:
// Validate Input Does Not Contain HTML Tags:
/**
 * @param {Object} dirtyInput - The input is an object
 * @returns {Object} - The output is an object
 */
module.exports.validateSanitizedHtml = (dirtyInput) => {
  for (const key in dirtyInput) {
    // deny every tags and attributes, only accept normal string
    let clean = sanitizeHtml(dirtyInput[key], {
      allowedTags: [],
      allowedAttributes: [],
    });
    if (clean != dirtyInput[key]) {
      return {
        success: false,
        message: `Header: ${key} with content ${dirtyInput[key]} is contaminated!`,
      };
    }
  }
  return {
    success: true,
    message: "Input is valid!",
  };
};
// Validate Input Array Does Not Contain HTML Tags:
/**
 * @param {Array} dirtyInputArray - The input is an object
 * @returns {Object} - The output is an object
 */
module.exports.validateSanitizedHtmlArray = (dirtyInputArray) => {
  for (let index = 0; index < dirtyInputArray.length; index++) {
    if (
      sanitizeHtml(dirtyInputArray[index], {
        allowedTags: [],
        allowedAttributes: [],
      }) != dirtyInputArray[index]
    )
      return {
        success: false,
        message: `${dirtyInputArray[index]} is containminated!`,
      };
  }
  return {
    success: true,
    message: "Array is valid!",
  };
};
