const { default: mongoose } = require("mongoose");
const Schema = require("mongoose").Schema;
// Define PricingsModel:
const PricingsModel = new Schema(
  {
    pricingName: { type: String },
    pricingValue: { type: Number },
    benefitsDescription: [{ type: String }],
  },
  { timestamps: true }
);
// Exports:
module.exports = mongoose.model("PricingsModel", PricingsModel);
