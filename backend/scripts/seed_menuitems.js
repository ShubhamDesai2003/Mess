const mongoose = require("mongoose");
require("dotenv").config({ path: "../../backend/config/config.env" });

const MONGO_URI = process.env.MONGO_URI;

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    console.log("✅ Connected to MongoDB");

    const menuCol = db.collection("menuitems");
    await menuCol.deleteMany({});

    const menuItems = [
      {
        day: "monday",
        breakfast: "poha with tea",
        lunch: "roti with aloo curry",
        dinner: "fried rice with chicken curry"
      },
      {
        day: "tuesday",
        breakfast: "idli with sambar",
        lunch: "roti with paneer butter masala",
        dinner: "biryani with chicken curry"
      },
      {
        day: "wednesday",
        breakfast: "upma with tea",
        lunch: "roti with potato fry",
        dinner: "curd rice with aloo curry"
      },
      {
        day: "thursday",
        breakfast: "paratha with tea",
        lunch: "roti with fish curry",
        dinner: "biryani with fish fry"
      },
      {
        day: "friday",
        breakfast: "dosa with chutney",
        lunch: "roti with paneer tikka",
        dinner: "fried rice with chicken curry"
      },
      {
        day: "saturday",
        breakfast: "boiled egg with tea",
        lunch: "roti with chicken curry",
        dinner: "paneer butter masala with roti"
      },
      {
        day: "sunday",
        breakfast: "omelette with tea",
        lunch: "roti with aloo curry",
        dinner: "biryani with chicken curry"
      }
    ];

    await menuCol.insertMany(menuItems);
    console.log("🎉 Menu items seeded successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding menu items:", err);
    process.exit(1);
  }
})();
