const morgan = require("morgan");
// Request Logger Dev:
const reqLoggerDev = morgan("dev");
// Request Logger Tiny:
const reqLoggerTiny = morgan("tiny");
// Exports:
module.exports = { reqLoggerDev, reqLoggerTiny };
