const router = require("express").Router();
// Custom Middlewares and Utils:
// Import Routers:
const PricingsRouter = require("./PricingsRouter");
// Use Routers:
// /api/v1/pricings/...
router.use("/pricings", PricingsRouter);
// Exports:
module.exports = router;
