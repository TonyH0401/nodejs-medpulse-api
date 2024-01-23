const router = require("express").Router();
// Custom Middlewares and Utils:
// Import Routers:
const PricingsRouter = require("./PricingsRouter");
const ContentsRouter = require("./ContentsRouter");
// Use Routers:
// /api/v1/pricings/...
router.use("/pricings", PricingsRouter);
// /api/v1/contents/...
router.use("/contents", ContentsRouter);
// Exports:
module.exports = router;
