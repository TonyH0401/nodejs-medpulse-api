const createError = require("http-errors");
// Custom Utils:
const {
  validateSanitizedHtml,
  validateSanitizedHtmlArray,
} = require("../../../utils/dataValidators");
// Custom Middlewares:
// Import Models:
const PricingsModel = require("../models/PricingsModel");
// Check If Input Data For Pricing Exist:
module.exports.inputDataExist = (req, res, next) => {
  const { pricingName, pricingValue, benefitsDescription } = req.body;
  try {
    if (!pricingName) return next(createError(400, "pricingName is missing!"));
    if (!pricingValue)
      return next(createError(400, "pricingValue is missing!"));
    if (!benefitsDescription)
      return next(createError(400, "benefitsDescription is missing!"));
    if (benefitsDescription.length == 0)
      return next(createError(400, "benefitsDescription is empty!"));
    return next();
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Check For Input Data Validation:
module.exports.inputPricingsValidation = (req, res, next) => {
  const { pricingName, pricingValue, benefitsDescription } = req.body;
  try {
    // check if pricingValue is a Number
    if (!(typeof pricingValue === "number"))
      return next(createError(400, "pricingValue is not a Number format!"));
    // check if pricingValue is a positive Number
    if (pricingValue < 0)
      return next(createError(400, "pricingValue cannot be negative!"));
    // check if String input is HTML containminated
    const sanitizedInputResult = validateSanitizedHtml({
      pricingName: pricingName,
    });
    if (!sanitizedInputResult.success)
      return next(createError(400, sanitizedInputResult.message));
    // check if String input is HTML Array containminated
    const sanitizedArrayInputResult =
      validateSanitizedHtmlArray(benefitsDescription);
    if (!sanitizedArrayInputResult.success)
      return next(createError(400, sanitizedArrayInputResult.message));
    return next();
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Create New Pricing:
module.exports.createNewPricing = async (req, res, next) => {
  const { pricingName, pricingValue, benefitsDescription } = req.body;
  try {
    let newPricing = new PricingsModel({
      pricingName: pricingName,
      pricingValue: pricingValue,
      benefitsDescription: benefitsDescription,
    });
    let result = await newPricing.save();
    return res.status(200).json({
      code: 1,
      success: true,
      message: "Create New Pricing!",
      data: result,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Get All Pricings:
module.exports.getAllPricing = async (req, res, next) => {
  try {
    const allPricings = await PricingsModel.find({});
    return res.status(200).json({
      code: 1,
      success: true,
      message: "List of all Pricings!",
      total: allPricings.length,
      data: allPricings,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Get Pricing by Id:
module.exports.getPricingById = async (req, res, next) => {
  const { pricingId } = req.params;
  try {
    const pricingExist = await PricingsModel.findById(pricingId);
    if (!pricingExist) return next(createError(400, "Pricing ID not found!"));
    return res.status(200).json({
      code: 1,
      success: true,
      message: "Pricing by ID found!",
      data: pricingExist,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Delete Pricing by Id:
module.exports.deletePricingById = async (req, res, next) => {
  const { pricingId } = req.params;
  try {
    const pricingExist = await PricingsModel.findById(pricingId);
    if (!pricingExist)
      return next(createError(404, "No Pricing Found for Deletion!"));
    const deleted = await PricingsModel.findByIdAndDelete(pricingId);
    return res.status(200).json({
      code: 1,
      success: true,
      message: `${pricingId} was deleted!`,
      data: deleted,
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
      return next(createError(404, "No Pricing Found for Update!"));
    if (pricingValue) {
      if (!(typeof pricingValue === "number"))
        return next(createError(400, "pricingValue is not a Number format!"));
      if (pricingValue < 0)
        return next(createError(400, "pricingValue cannot be negative!"));
    }
    pricingExist.pricingName = pricingName || pricingExist.pricingName;
    pricingExist.pricingValue = pricingValue | pricingExist.pricingValue;
    pricingExist.benefitsDescription =
      benefitsDescription || pricingExist.benefitsDescription;
    const result = await pricingExist.save();
    return res.status(200).json({
      code: 1,
      success: true,
      message: `Updated ${pricingId}`,
      data: result,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
