const router = require("express").Router();
const createError = require("http-errors");
// Custom Utils:
// Custom Middlewares:
const {
  createPricing,
  getAllPricing,
  getPricingById,
  deletePricingById,
  updatePricingById,
} = require("../middlewares/PricingsMiddlewares");
// Pricings Routers:
//
router.route("/pricing").post(createPricing).get(getAllPricing);
//
router
  .route("/pricing/:pricingId")
  .get(getPricingById)
  .patch(updatePricingById)
  .delete(deletePricingById);
// Pricings Error Handling:
router
  .use((req, res, next) => {
    next(createError(404, "This /pricings directory does not exist!"));
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
