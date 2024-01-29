const router = require("express").Router();
const createError = require("http-errors");
// Custom Utils:
// Custom Middlewares:
const {
  uploadFileMulter,
  createUser,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
} = require("../middlewares/UsersMiddlewares");
// Contents Routers:
//
router.route("/user").post(uploadFileMulter, createUser).get(getAllUsers);
//
router
  .route("/user/:userId")
  .get(getUserById)
  .patch(uploadFileMulter, updateUserById)
  .delete(deleteUserById);
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
