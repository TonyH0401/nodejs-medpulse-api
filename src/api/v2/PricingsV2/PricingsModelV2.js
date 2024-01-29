const { default: mongoose } = require("mongoose");
const Schema = require("mongoose").Schema;
// Database Connection V2:
const { dbConnectionV2 } = require("../../../database/mongooseV2");
// Define PricingsModel:
const PricingsModelV2 = dbConnectionV2.model(
  "PricingsModelV2",
  new Schema(
    {
      pricingName: { type: String },
      pricingValue: { type: Number },
      benefitsDescription: [{ type: String }],
    },
    { timestamps: true }
  )
);
// Exports:
module.exports = PricingsModelV2;
