const { default: mongoose } = require("mongoose");
const Schema = require("mongoose").Schema;
// Define ContentsModel:
const ContentsModel = new Schema(
  {
    contentCaption: { type: String },
    contentBody: { type: String },
    contentImageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);
// Exports:
module.exports = mongoose.model("ContentsModel", ContentsModel);
