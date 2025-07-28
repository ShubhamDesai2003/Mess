// scripts/aggregateDaily.js
const mongoose = require("mongoose");
// const Buyer = require("../models/Buyer");
const { Buyer } = require("../models/Buyer");  // ✅ destructure from module.exports

const Daily = require("../models/DailySelection");


const dayMap = {
  monday: 1,
  tuesday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
  sunday: 0,
};

function computeDateForDayName(dayName) {
  const today = new Date();
  const currentDay = today.getDay();
  const targetDay = dayMap[dayName.toLowerCase()];
  const delta = (targetDay - currentDay + 7) % 7;
  const date = new Date(today);
  date.setDate(today.getDate() + delta);
  return date;
}


async function aggregateSelections() {
  const buyers = await Buyer.find({});
  const dailyCounts = {};  // { '2025-07-20': { breakfast: 0, lunch: 0, dinner: 0 }, ... }

  buyers.forEach(b => {
    Object.entries(b.this).forEach(([dayName, meals]) => {
      // compute actual date from 'this' structure if you store weekStart elsewhere,
      // or assume 'this' always refers to the current week and map dayName -> real date
      const date = computeDateForDayName(dayName); // you’ll need a helper
      const key = date.toISOString().slice(0,10);
      dailyCounts[key] = dailyCounts[key] || { breakfast:0, lunch:0, dinner:0 };

      ["breakfast","lunch","dinner"].forEach(m => {
        if (meals[m]) dailyCounts[key][m]++;
      });
    });
  });

  // Upsert into DB
  for (const [dateStr, counts] of Object.entries(dailyCounts)) {
    await Daily.findOneAndUpdate(
      { date: new Date(dateStr) },
      { $set: counts },
      { upsert: true }
    );
  }

  console.log("✅ Daily aggregates saved");
}


module.exports = aggregateSelections; // ✅ EXPORT IT

// Only call if running directly from CLI
if (require.main === module) {
  aggregateSelections();
}

