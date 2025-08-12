// ai/forecast_service/seed_multiple_orders.js
const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");

require("dotenv").config({ path: "../../backend/config/config.env" });

const MONGO_URI = process.env.MONGO_URI;

function getDayName(date) {
  return ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][date.getDay()];
}

function generateEmptySelection() {
  return {
    monday:    { breakfast: false, lunch: false, dinner: false },
    tuesday:   { breakfast: false, lunch: false, dinner: false },
    wednesday: { breakfast: false, lunch: false, dinner: false },
    thursday:  { breakfast: false, lunch: false, dinner: false },
    friday:    { breakfast: false, lunch: false, dinner: false },
    saturday:  { breakfast: false, lunch: false, dinner: false },
    sunday:    { breakfast: false, lunch: false, dinner: false }
  };
}

function generateRandomDaySelection(dayName) {
  return {
    breakfast: Math.random() > 0.5,
    lunch:     Math.random() > 0.5,
    dinner:    Math.random() > 0.5
  };
}

async function seedOrders() {
  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    console.log("✅ Connected to MongoDB");

    const ordersCollection = db.collection("orders");
    const usersCollection = db.collection("users");

    // Optional: Clear old test data
    await ordersCollection.deleteMany({});
    await usersCollection.deleteMany({ email: /testuser\d+@example\.com/ });

    const orders = [];
    const users = [];

    const studentCount = faker.number.int({ min: 30, max: 40 });

    for (let s = 0; s < studentCount; s++) {
      const userId = new mongoose.Types.ObjectId();
      const email = `testuser${s}@example.com`;

      // Create fake user
      users.push({
        _id: userId,
        email,
        bought: true,
        next: generateEmptySelection(),
        this: generateEmptySelection(),
        secret: faker.string.alphanumeric(4).toUpperCase()
      });

      // Create 10 weeks of orders
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      for (let i = 0; i < 70; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const day = getDayName(date);

        const selected = generateEmptySelection();
        selected[day] = generateRandomDaySelection(day);

        orders.push({
          user: userId,
          selected,
          status: "completed",
          createdAt: date,
          __v: 0
        });
      }
    }

    await usersCollection.insertMany(users);
    await ordersCollection.insertMany(orders);

    console.log(`🎉 Seeded ${studentCount} students with 10 weeks of orders successfully.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding orders:", err);
    process.exit(1);
  }
}

seedOrders();
