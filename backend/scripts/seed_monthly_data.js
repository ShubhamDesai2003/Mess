const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
require("dotenv").config({ path: "../../backend/config/config.env" });

const MONGO_URI = process.env.MONGO_URI;
const Daily = require("../../backend/models/DailySelection");

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await Daily.deleteMany({});

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const data = [];
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      data.push({
        date,
        breakfast: faker.number.int({ min: 50, max: 100 }),
        lunch: faker.number.int({ min: 50, max: 100 }),
        dinner: faker.number.int({ min: 50, max: 100 })
      });
    }

    await Daily.insertMany(data);
    console.log("🎉 Daily selection data seeded successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding daily selection:", err);
    process.exit(1);
  }
}

seed();
