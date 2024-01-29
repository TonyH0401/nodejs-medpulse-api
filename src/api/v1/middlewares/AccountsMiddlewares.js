const createError = require("http-errors");
const multer = require("multer");
const fse = require("fs-extra");
const path = require("path");
// Custom Utils:
// Custom Middlewares:
// Import Models:
const AccountsModel = require("../models/AccountsModels");
const UsersModel = require("../models/UsersModel");
// Create Account:
module.exports.createAccount = async (req, res, next) => {
  const { accountUsername, accountPassword, User } = req.body;
  try {
    // check if user exist
    const userExist = await UsersModel.findById(User);
    if (!userExist) return next(createError(404, `UserId ${User} Not Found!`));
    // create new account
    let accountNew = await AccountsModel({
      accountUsername: accountUsername || userExist.fullName,
      accountPassword: accountPassword || "admin",
      User: userExist || null,
    });
    // save new account to database
    const accountCreated = await accountNew.save();
    return res.status(200).json({
      code: 1,
      success: true,
      message: "Account Created!",
      data: accountCreated,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Get All Accounts (include User binds with the Account):
module.exports.getAllAccounts = async (req, res, next) => {
  try {
    const accountAll = await AccountsModel.find({}).populate("User");
    return res.status(200).json({
      code: 1,
      success: true,
      message: "All Accounts!",
      counter: accountAll.length,
      data: accountAll,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Get Account By Id:
module.exports.getAccountById = async (req, res, next) => {
  const { accountId } = req.params;
  try {
    const accountExist = await AccountsModel.findById(accountId).populate(
      "User"
    );
    if (!accountExist)
      return next(createError(404, `AccountId ${accountId} Not Found!`));
    return res.status(200).json({
      code: 1,
      success: true,
      message: `AccountId ${accountId} Found!`,
      data: accountExist,
    });
  } catch (error) {
    console.log("demomode");
    return next(createError(500, error.message));
  }
};
// Update Account By Id:
module.exports.updateAccountById = async (req, res, next) => {
  const { accountId } = req.params;
  const { accountUsername, accountPassword, User } = req.body;
  try {
    // check if account exist
    let accountExist = await AccountsModel.findById(accountId);
    if (!accountExist)
      return next(createError(404, `AccountId ${accountId} Not Found!`));
    // update account
    accountExist.accountUsername =
      accountUsername || accountExist.accountUsername;
    accountExist.accountPassword =
      accountPassword || accountExist.accountPassword;
    accountExist.User = (await UsersModel.findById(User)) || accountExist.User;
    // save account to database
    const updatedAccount = await (await accountExist.save()).populate("User");
    return res.status(200).json({
      code: 1,
      success: true,
      message: `Updated AccountId ${accountId}!`,
      data: updatedAccount,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Delete Account By Id:
module.exports.deleteAccountById = async (req, res, next) => {
  const { accountId } = req.params;
  try {
    const accountExist = await AccountsModel.findById(accountId);
    if (!accountExist)
      return next(createError(404, `AccountId ${accountId} Not Found!`));
    const deletedAccount = await AccountsModel.findByIdAndDelete(accountId);
    return res.status(200).json({
      code: 1,
      success: true,
      message: `Deleted AccountId ${accountId}!`,
      data: deletedAccount,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
