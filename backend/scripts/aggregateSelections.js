// scripts/aggregateSelections.js
const { Buyer } = require("../models/Buyer");
const WeeklySelection = require("../models/WeeklySelection");

// async function runAggregation() {
//   const buyers = await Buyer.find({});
//   console.log("Found buyers:", buyers.length);
//   // ... rest of your aggregation logic ...
// }

// runAggregation();

module.exports = async function aggregateSelections() {
  const counts = {
    monday:    { breakfast: 0, lunch: 0, dinner: 0 },
    tuesday:   { breakfast: 0, lunch: 0, dinner: 0 },
    wednesday: { breakfast: 0, lunch: 0, dinner: 0 },
    thursday:  { breakfast: 0, lunch: 0, dinner: 0 },
    friday:    { breakfast: 0, lunch: 0, dinner: 0 },
    saturday:  { breakfast: 0, lunch: 0, dinner: 0 },
    sunday:    { breakfast: 0, lunch: 0, dinner: 0 },
  };

  const buyers = await Buyer.find({});

  for (const buyer of buyers) {
    const weekData = buyer.this; // Or 'next' for future-based forecasting

    for (const day in counts) {
      if (!weekData[day]) continue;

      ["breakfast", "lunch", "dinner"].forEach(meal => {
        if (weekData[day][meal]) {
          counts[day][meal]++;
        }
      });
    }
  }

  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay())); // Sunday start

  const doc = new WeeklySelection({ weekStart, data: counts });
  await doc.save();
  console.log("✅ Weekly data saved to WeeklySelection");
  // console.log(doc);
  
};
