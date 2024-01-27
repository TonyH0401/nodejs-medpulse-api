const router = require("express").Router();
const createError = require("http-errors");
// Custom Utils:
// Custom Middlewares:
const {
  uploadFileMulter,
  createPost,
  getAllPosts,
  getPostById,
  updatePostById,
  deletePostById,
} = require("../middlewares/PostsMiddlewares");
// Contents Routers:
//
router.route("/post").post(uploadFileMulter, createPost).get(getAllPosts);
//
router
  .route("/post/:postId")
  .get(getPostById)
  .patch(uploadFileMulter, updatePostById)
  .delete(deletePostById);
// Contents Error Handling:
router
  .use((req, res, next) => {
    next(createError(404, "This /posts directory does not exist!"));
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
