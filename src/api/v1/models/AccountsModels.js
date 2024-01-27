const { default: mongoose } = require("mongoose");
const Schema = require("mongoose").Schema;
// Define AccountsModel:
const AccountsModel = new Schema(
  {
    accountUsername: { type: String },
    accountPassword: { type: String },
    User: { type: Schema.Types.ObjectId, ref: "UsersModel" },
  },
  { timestamps: true }
);
// Exports:
module.exports = mongoose.model("AccountsModel", AccountsModel);
