const router = require("express").Router();
const createError = require("http-errors");
// Custom Utils:
// Custom Middlewares:
const {
  createAccount,
  getAllAccounts,
  getAccountById,
  updateAccountById,
  deleteAccountById,
} = require("../middlewares/AccountsMiddlewares");
// Contents Routers:
//
router.route("/account").post(createAccount).get(getAllAccounts);
//
router
  .route("/account/:accountId")
  .get(getAccountById)
  .patch(updateAccountById)
  .delete(deleteAccountById);
// Contents Error Handling:
router
  .use((req, res, next) => {
    next(createError(404, "This /accounts directory does not exist!"));
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
