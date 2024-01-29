const router = require("express").Router();
const createError = require("http-errors");
// Custom Utils:
// Custom Middlewares:
const {
  uploadFileMulter,
  createContent,
  getAllContents,
  getContentById,
  updateContentById,
  deleteContentById,
  editContentById,
  editContentImgById,
} = require("../middlewares/ContentsMiddlewares");
// Contents Routers:
//
router
  .route("/content")
  .post(uploadFileMulter, createContent)
  .get(getAllContents);
//
router
  .route("/content/:contentId")
  .get(getContentById)
  .patch(uploadFileMulter, updateContentById)
  .delete(deleteContentById);

// .patch(editContentById)
// .delete(deleteContentById);
// //
// router
//   .route("/content/:contentId/update-image")
//   .patch(createContentsFileMulter, editContentImgById);
// Contents Error Handling:
router
  .use((req, res, next) => {
    next(createError(404, "This /contents directory does not exist!"));
  })
  .use((err, req, res, next) => {
    let errorStatus = err.status || 404;
    let errorMessage = err.message || "";
    return res.status(errorStatus).json({
      code: 0,
      success: false,
      message: errorMessage,
    });
  });
// Exports:
module.exports = router;
