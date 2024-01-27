const router = require("express").Router();
const createError = require("http-errors");
// Custom Utils:
// Custom Middlewares:
const {
  uploadCreateUser,
  createUserAccount,
  getUserById,
  getAllUsers,
  updateUserById,
  updateUserImageById,
  deleteUserById,
} = require("../middlewares/UsersMiddlewares");
// Contents Routers:
//
router
  .route("/user")
  .post(uploadCreateUser, createUserAccount)
  .get(getAllUsers);
//
router
  .route("/user/:userId")
  .get(getUserById)
  .patch(updateUserById)
  .delete(deleteUserById);
//
router
  .route("/user/:userId/update-image")
  .patch(uploadCreateUser, updateUserImageById);
// Contents Error Handling:
router
  .use((req, res, next) => {
    next(createError(404, "This /users directory does not exist!"));
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
