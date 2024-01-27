const { default: mongoose } = require("mongoose");
const Schema = require("mongoose").Schema;
// Define UsersModel:
const UsersModel = new Schema(
  {
    fullName: { type: String },
    emailAddress: { type: String, required: true },
    phoneNumber: { type: String },
    homeAddress: { type: String },
    avatarImageUrl: { type: String, default: "" },
  },
  { timestamps: true }
);
// Exports:
module.exports = mongoose.model("UsersModel", UsersModel);
