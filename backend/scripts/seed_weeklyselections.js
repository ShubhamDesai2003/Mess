const mongoose = require("mongoose");
require("dotenv").config({ path: "../../backend/config/config.env" });

const MONGO_URI = process.env.MONGO_URI;

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    console.log("✅ Connected to MongoDB");

    const weeklyCol = db.collection("weeklyselections");
    await weeklyCol.deleteMany({});

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weeks = [];
    for (let i = 0; i < 10; i++) {
      const monday = new Date(today);
      monday.setDate(today.getDate() - today.getDay() + 1 - (i * 7));

      weeks.push({
        weekStart: monday,
        data: {
          monday:    { breakfast: 28, lunch: 35, dinner: 26 },
          tuesday:   { breakfast: 25, lunch: 38, dinner: 22 },
          wednesday: { breakfast: 32, lunch: 37, dinner: 28 },
          thursday:  { breakfast: 27, lunch: 34, dinner: 29 },
          friday:    { breakfast: 35, lunch: 40, dinner: 33 },
          saturday:  { breakfast: 24, lunch: 30, dinner: 21 },
          sunday:    { breakfast: 22, lunch: 28, dinner: 20 }
        }       
      });
    }

    await weeklyCol.insertMany(weeks);
    console.log("🎉 Weekly selections seeded successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding weekly selections:", err);
    process.exit(1);
  }
})();
