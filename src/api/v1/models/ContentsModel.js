const createError = require("http-errors");
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
// Pre Operations (Triggers):
const ServicesModel = require("../models/ServicesModel");
ContentsModel.pre("findOneAndDelete", async function (next) {
  try {
    const contentId = this.getQuery()._id;
    // Update all assignments with the current person's _id to remove the reference
    await ServicesModel.updateMany(
      { Contents: contentId },
      { $pull: { Contents: contentId } }
    );
    return next();
  } catch (err) {
    return next(createError(500, err.message));
  }
});
// Exports:
module.exports = mongoose.model("ContentsModel", ContentsModel);
