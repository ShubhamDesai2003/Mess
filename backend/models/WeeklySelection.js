// models/WeeklySelection.js
const mongoose = require("mongoose");

const selectionSchema = new mongoose.Schema({
  weekStart: { type: Date, required: true, unique: true }, // Start date of the week (Monday/Sunday)
  data: {
    monday: { breakfast: Number, lunch: Number, dinner: Number },
    tuesday: { breakfast: Number, lunch: Number, dinner: Number },
    wednesday: { breakfast: Number, lunch: Number, dinner: Number },
    thursday: { breakfast: Number, lunch: Number, dinner: Number },
    friday: { breakfast: Number, lunch: Number, dinner: Number },
    saturday: { breakfast: Number, lunch: Number, dinner: Number },
    sunday: { breakfast: Number, lunch: Number, dinner: Number },
  }
});

module.exports = mongoose.model("WeeklySelection", selectionSchema);
