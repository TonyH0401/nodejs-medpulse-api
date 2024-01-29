const router = require("express").Router();
// Custom Utils:
// Custom Middlewares:
// Pricings Router: /api/v2/pricings/...
const PricingsRouterV2 = require("./PricingsV2/PricingsRouterV2");
router.use("/pricings", PricingsRouterV2);
// Exports:
module.exports = router;
