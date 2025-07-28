const axios = require("axios");
module.exports = axios.create({
  baseURL: process.env.FORECAST_URL || "http://localhost:5000"
});
