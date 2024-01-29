require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const createError = require("http-errors");
const path = require("path");
const cors = require("cors");
// Custom Utils:
const { reqLoggerDev, reqLoggerTiny } = require("./utils/reqLogger");
const { connectMongoDB } = require("./database/mongoose");
// Env Variable:
const port = process.env.API_PORT || 8080;
// Init App:
const app = express();
// App Use:
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(reqLoggerDev);
app.use(cors());
// Default Route:
app.get("/", (req, res) => {
  return res.status(200).json({
    code: 1,
    success: true,
    message: "Default Branch!",
  });
});
// API Routers:
const v1API = require("./api/v1/routers/index");
app.use("/api/v1", v1API);
// const v2API = require("./api/v2/routes");
// app.use("/api/v2", v2API);
// Default Error Handling:
app.use((req, res, next) => {
  next(createError(404, "This directory does not exist!"));
});
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  return res.status(404).json({
    code: 0,
    success: false,
    message: err.message || "",
  });
});
// Connect Database:
connectMongoDB();
// Init Server:
app.listen(port, () => {
  console.log(`> Website running at http://localhost:${port}`);
});
