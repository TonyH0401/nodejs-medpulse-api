const mongoose = require("mongoose");
// Env Variable
const mongodbURL = process.env.MONGODB;
// Mongoose Options:
const options = { useNewUrlParser: true, useUnifiedTopology: true };
// Connect MongoDB using mongoose:
async function connectMongoDB() {
  try {
    await mongoose.connect(mongodbURL, options);
    console.log(
      "> Database connected with state: " +
        mongoose.STATES[mongoose.connection.readyState]
    );
  } catch (error) {
    console.log(
      "> Failed to connect database with state: " +
        mongoose.STATES[mongoose.connection.readyState]
    );
    console.log(error);
  }
}
// Exports:
module.exports = { connectMongoDB };
