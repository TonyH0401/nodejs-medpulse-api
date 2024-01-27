const router = require("express").Router();
// Custom Middlewares and Utils:
// Import Routers:
const PricingsRouter = require("./PricingsRouter");
const ContentsRouter = require("./ContentsRouter");
const ServicesRouter = require("./ServicesRouter");
const UsersRouter = require("./UsersRouter");
const AccountsRouter = require("./AccountsRouter");
// Use Routers:
// /api/v1/pricings/...
router.use("/pricings", PricingsRouter);
// /api/v1/contents/...
router.use("/contents", ContentsRouter);
// /api/v1/services/...
router.use("/services", ServicesRouter);
// /api/v1/users/...
router.use("/users", UsersRouter);
//
router.use("/accounts", AccountsRouter);
router;
// Exports:
module.exports = router;
