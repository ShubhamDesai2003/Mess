// models/DailySelection.js
const mongoose = require("mongoose");
const dailySchema = new mongoose.Schema({
  date:      { type: Date, unique: true, required: true },
  breakfast: { type: Number, default: 0 },
  lunch:     { type: Number, default: 0 },
  dinner:    { type: Number, default: 0 }
});
module.exports = mongoose.model("DailySelection", dailySchema);
