const mongoose = require("mongoose");
// Env Variable
const mongodbURL = process.env.MONGODBV2;
// Mongoose Options:
const options = { useNewUrlParser: true, useUnifiedTopology: true };
// Connect MongoDB using mongoose:
const dbConnectionV2 = mongoose.createConnection(mongodbURL, options);
// Listen for Connection Events:
dbConnectionV2.on("connected", () => {
  console.log("> API 2 connected to MongoDB");
});
dbConnectionV2.on("error", (err) => {
  console.error("> API 2 connection error:", err);
});
dbConnectionV2.on("disconnected", () => {
  console.log("> API 2 disconnected from MongoDB");
});
// Exports:
module.exports = { dbConnectionV2 };
