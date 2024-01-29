const router = require("express").Router();
// Custom Utils:
// Custom Middlewares:
// Pricings Router: /api/v1/pricings/...
const PricingsRouter = require("./PricingsRouter");
router.use("/pricings", PricingsRouter);
// Contents Router: /api/v1/contents/...
const ContentsRouter = require("./ContentsRouter");
router.use("/contents", ContentsRouter);
// Services Router: /api/v1/services/...
const ServicesRouter = require("./ServicesRouter");
router.use("/services", ServicesRouter);
// Users Router: /api/v1/users/...
const UsersRouter = require("./UsersRouter");
router.use("/users", UsersRouter);
// Accounts Router: /api/v1/accounts/...
const AccountsRouter = require("./AccountsRouter");
router.use("/accounts", AccountsRouter);
// PostsRouter: /api/v1/posts/...
const PostsRouter = require("./PostsRouter");
router.use("/posts", PostsRouter);
// Exports:
module.exports = router;
