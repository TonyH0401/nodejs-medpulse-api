const { default: mongoose } = require("mongoose");
const Schema = require("mongoose").Schema;
// Define ContentsModel:
const ServicesModel = new Schema(
  {
    serviceName: { type: String },
    serviceBannerUrl: { type: String, default: "" },
    Contents: [{ type: Schema.Types.ObjectId, ref: "ContentsModel" }],
  },
  { timestamps: true }
);
// Exports:
module.exports = mongoose.model("ServicesModel", ServicesModel);
