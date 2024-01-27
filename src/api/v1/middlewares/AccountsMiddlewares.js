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
    // check if User exist
    const userExist = await UsersModel.findById(User);
    // create new Account
    let newAccount = await AccountsModel({
      accountUsername: accountUsername,
      accountPassword: accountPassword,
    });
    // if User exist or User is valid then save to Account
    if (userExist) newAccount.User = userExist;
    // save new Account
    const createdAccount = await newAccount.save();
    return res.status(200).json({
      code: 1,
      success: true,
      message: "New Account Created!",
      data: createdAccount,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
// Get All Accounts (include User binds with the Account):
module.exports.getAllAccounts = async (req, res, next) => {
  try {
    const allAccounts = await AccountsModel.find({}).populate("User");
    return res.status(200).json({
      code: 1,
      success: true,
      message: "All Accounts!",
      counter: allAccounts.length,
      data: allAccounts,
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
// Update Account By Id: - not done
module.exports.updateAccountById = async (req, res, next) => {
  const { accountId } = req.params;
  const { accountUsername, accountPassword, User } = req.body;
  console.log(User);
  try {
    let accountExist = await AccountsModel.findById(accountId);
    if (!accountExist)
      return next(createError(404, `AccountId ${accountId} Not Found!`));
    accountExist.accountUsername =
      accountUsername || accountExist.accountUsername;
    accountExist.accountPassword =
      accountPassword || accountExist.accountPassword;
    accountExist.User = (await UsersModel.findById(User)) || accountExist.User;
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
      message: `Updated AccountId ${accountId}!`,
      data: deletedAccount,
    });
  } catch (error) {
    return next(createError(500, error.message));
  }
};
