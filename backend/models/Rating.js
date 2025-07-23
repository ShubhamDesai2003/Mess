const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema({
  mealType:  { type: String, enum: ['breakfast', 'lunch', 'dinner'], required: true },
  dishName:  { type: String, required: true },
  rating:    { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now }
});

const ratingDaySchema = new mongoose.Schema({
  email: { type: String, required: true },
  day:   { type: String, required: true },
  meals: [mealSchema]
});

// Ensure one document per user+day
ratingDaySchema.index({ email: 1, day: 1 }, { unique: true });

module.exports = mongoose.model("Rating", ratingDaySchema);
