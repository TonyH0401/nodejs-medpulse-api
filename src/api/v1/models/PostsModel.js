const { default: mongoose } = require("mongoose");
const Schema = require("mongoose").Schema;
// Define PostsModel:
const PostsModel = new Schema(
  {
    postTitle: { type: String },
    postSubTitle: { type: String },
    postBody: { type: String },
    postAuthor: {
      type: Schema.Types.ObjectId,
      ref: "UsersModel",
    },
    attachedFiles: { type: String },
  },
  { timestamps: true }
);
// Exports:
module.exports = mongoose.model("PostsModel", PostsModel);
