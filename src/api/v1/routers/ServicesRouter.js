const router = require("express").Router();
const createError = require("http-errors");
// Custom Utils:
// Custom Middlewares:
const {
  uploadFileMulter,
  createService,
  getAllServices,
  getServiceById,
  updateServiceById,
  deleteServiceById,
} = require("../middlewares/ServicesMiddlewares");
// Services Routers:
//
router
  .route("/service")
  .post(uploadFileMulter, createService)
  .get(getAllServices);
//
router
  .route("/service/:serviceId")
  .get(getServiceById)
  .patch(uploadFileMulter, updateServiceById)
  .delete(deleteServiceById);
//   .delete(deleteServiceById);
// // update image
// router
//   .route("/service/:serviceId/update-image")
//   .patch(uploadCreateService, updateServiceImageById);
// Contents Error Handling:
router
  .use((req, res, next) => {
    next(createError(404, "This /services directory does not exist!"));
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
