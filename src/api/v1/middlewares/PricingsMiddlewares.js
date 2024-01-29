const createError = require("http-errors");
// Custom Utils:
// Custom Middlewares:
// Import Models:
const PricingsModel = require("../models/PricingsModel");
// Create Pricing:
module.exports.createPricing = async (req, res, next) => {
  const { pricingName, pricingValue, benefitsDescription } = req.body;
  try {
    let pricingNew = new PricingsModel({
      pricingName: pricingName || "",
      pricingValue: !pricingValue ? 0 : pricingValue < 0 ? 0 : pricingValue,
      benefitsDescription: benefitsDescription || [],
    });
    let pricingCreated = await pricingNew.save();
    return res.status(200).json({
      code: 1,
      success: true,
      message: "Created Pricing!",
      data: pricingCreated,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Get Pricing All:
module.exports.getAllPricing = async (req, res, next) => {
  try {
    const pricingAll = await PricingsModel.find({});
    return res.status(200).json({
      code: 1,
      success: true,
      message: "All Pricings!",
      counter: pricingAll.length,
      data: pricingAll,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Get Pricing By Id:
module.exports.getPricingById = async (req, res, next) => {
  const { pricingId } = req.params;
  try {
    const pricingExist = await PricingsModel.findById(pricingId);
    if (!pricingExist)
      return next(createError(404, `PricingId ${pricingId} Not Found!`));
    return res.status(200).json({
      code: 1,
      success: true,
      message: `PricingId ${pricingId} Found!`,
      data: pricingExist,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Delete Pricing By Id:
module.exports.deletePricingById = async (req, res, next) => {
  const { pricingId } = req.params;
  try {
    const pricingExist = await PricingsModel.findById(pricingId);
    if (!pricingExist)
      return next(createError(404, `PricingId ${pricingId} Not Found!`));
    const pricingDeleted = await PricingsModel.findByIdAndDelete(pricingId);
    return res.status(200).json({
      code: 1,
      success: true,
      message: `Deleted ${pricingId}!`,
      data: pricingDeleted,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Update Pricing By Id:
module.exports.updatePricingById = async (req, res, next) => {
  const { pricingId } = req.params;
  const { pricingName, pricingValue, benefitsDescription } = req.body;
  try {
    let pricingExist = await PricingsModel.findById(pricingId);
    if (!pricingExist)
      return next(createError(404, `PricingId ${pricingId} Found!`));
    if (pricingValue)
      if (!(typeof pricingValue === "number"))
        return next(createError(400, "pricingValue is not Number format!"));
    pricingExist.pricingName = pricingName || pricingExist.pricingName;
    pricingExist.pricingValue = !pricingValue
      ? pricingExist.pricingValue
      : pricingValue < 0
      ? 0
      : pricingValue;
    pricingExist.benefitsDescription =
      benefitsDescription || pricingExist.benefitsDescription;
    const pricingUpdated = await pricingExist.save();
    return res.status(200).json({
      code: 1,
      success: true,
      message: `Updated ${pricingId}!`,
      data: pricingUpdated,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
