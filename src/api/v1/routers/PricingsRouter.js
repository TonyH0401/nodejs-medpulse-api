const router = require("express").Router();
const createError = require("http-errors");
// Custom Utils::
// Custom Middlewares:
// Pricings Routers:
router.route("/").get((req, res) => {
  return res.status(200).json({
    success: true,
  });
});
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
