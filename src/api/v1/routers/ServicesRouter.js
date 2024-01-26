const router = require("express").Router();
const createError = require("http-errors");
// Custom Utils:
// Custom Middlewares:
const {
  uploadCreateService,
  createService,
  getAllServices,
  getServiceById,
  updateServiceById,
  deleteServiceById,
  updateServiceImageById,
} = require("../middlewares/ServicesMiddlewares");
// Services Routers:
//
router
  .route("/service")
  .get(getAllServices)
  .post(uploadCreateService, createService);
//
router
  .route("/service/:serviceId")
  .get(getServiceById)
  .patch(updateServiceById)
  .delete(deleteServiceById);
// update image
router
  .route("/service/:serviceId/update-image")
  .patch(uploadCreateService, updateServiceImageById);
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
