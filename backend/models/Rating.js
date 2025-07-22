// server/models/Rating.js
const mongoose = require('mongoose');

// const ratingSchema = new mongoose.Schema({
//   email:     { type: String, required: true, index: true },
//   day:       { 
//     type: String, 
//     required: true, 
//     enum: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] 
//   },
//   mealType:  { 
//     type: String, 
//     required: true, 
//     enum: ['breakfast','lunch','dinner'] 
//   },
//   rating:    { type: Number, required: true, min: 1, max: 5 },
//   createdAt: { type: Date, default: Date.now }
// });

// // Ensure one rating per user/day/meal
// ratingSchema.index({ email: 1, day: 1, mealType: 1 }, { unique: true });

// module.exports = mongoose.model('Rating', ratingSchema);


const ratingSchema = new mongoose.Schema({
  email:     { type: String, required: true, index: true },
  day:       { type: String, required: true, enum: ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'] },
  mealType:  { type: String, required: true, enum: ['breakfast','lunch','dinner'] },
  rating:    { type: Number, required: true, min: 1, max: 5 },
  dishName:  { type: String, required: true }, // ✅ new field
  createdAt: { type: Date, default: Date.now }
});

ratingSchema.index({ email: 1, day: 1, mealType: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
