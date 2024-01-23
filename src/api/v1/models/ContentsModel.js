const { default: mongoose } = require("mongoose");
const Schema = require("mongoose").Schema;
// Define ContentsModel:
const ContentsModel = new Schema(
  {
    contentCaption: { type: String },
    contentBody: { type: Number },
    contentImage: { type: String },
  },
  { timestamps: true }
);
// Exports:
module.exports = mongoose.model("PricingsModel", PricingsModel);
