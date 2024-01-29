const createError = require("http-errors");
// Custom Utils:
// Custom Middlewares:
// Import Models:
const PricingsModelV2 = require("./PricingsModelV2");
// Create New Pricing:
module.exports.createPricing = async (req, res, next) => {
  const { pricingName, pricingValue, benefitsDescription } = req.body;
  try {
    let pricingNew = new PricingsModelV2({
      pricingName: pricingName || "",
      pricingValue: !pricingValue ? 0 : pricingValue < 0 ? 0 : pricingValue,
      benefitsDescription: benefitsDescription || [],
    });
    const pricingCreated = await pricingNew.save();
    return res.status(200).json({
      code: 1,
      success: true,
      message: "New Pricing Created!",
      data: pricingCreated,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Get All Pricings:
module.exports.getAllPricings = async (req, res, next) => {
  try {
    const allPricings = await PricingsModelV2.find({});
    return res.status(200).json({
      code: 1,
      success: true,
      message: "All Pricings!",
      counter: allPricings.length,
      data: allPricings,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Get Pricing By Id:
module.exports.getPricingById = async (req, res, next) => {
  const { pricingId } = req.params;
  try {
    const pricingExist = await PricingsModelV2.findById(pricingId);
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
// Update Pricing By Id:
module.exports.updatePricingById = async (req, res, next) => {
  const { pricingId } = req.params;
  try {
    const pricingExist = await PricingsModelV2.findById(pricingId);
    if (!pricingExist)
      return next(createError(404, `PricingId ${pricingId} Not Found!`));
    
  } catch (error) {
    return next(createError(500, error.message));
  }
};
