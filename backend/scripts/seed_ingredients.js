const mongoose = require("mongoose");
require("dotenv").config({ path: "../../backend/config/config.env" });

const MONGO_URI = process.env.MONGO_URI;

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection.db;
    console.log("✅ Connected to MongoDB");

    const ingredientsCol = db.collection("ingredients");
    await ingredientsCol.deleteMany({});

    // const ingredients = [
    //   { name: "Rice", unit: "kg", dishes: ["fried rice", "biryani", "curd rice"] },
    //   { name: "Wheat Flour", unit: "kg", dishes: ["roti", "paratha"] },
    //   { name: "Potato", unit: "kg", dishes: ["aloo curry", "samosa", "potato fry"] },
    //   { name: "Onion", unit: "kg", dishes: ["all dishes"] },
    //   { name: "Tomato", unit: "kg", dishes: ["all dishes"] },
    //   { name: "Milk", unit: "liters", dishes: ["tea", "coffee", "curd rice"] },
    //   { name: "Eggs", unit: "pieces", dishes: ["boiled egg", "omelette"] },
    //   { name: "Chicken", unit: "kg", dishes: ["chicken curry", "chicken biryani"] },
    //   { name: "Fish", unit: "kg", dishes: ["fish curry", "fish fry"] },
    //   { name: "Paneer", unit: "kg", dishes: ["paneer butter masala", "paneer tikka"] }
    // ];

    // const ingredients = [
    //   { name: "Rice", unit: "kg", dishes: ["fried rice", "biryani", "curd rice"], perPerson: 0.12 },
    //   { name: "Wheat Flour", unit: "kg", dishes: ["roti", "paratha"], perPerson: 0.08 },
    //   { name: "Potato", unit: "kg", dishes: ["aloo curry", "samosa", "potato fry"], perPerson: 0.06 },
    //   { name: "Onion", unit: "kg", dishes: ["all dishes"], perPerson: 0.03 },
    //   { name: "Tomato", unit: "kg", dishes: ["all dishes"], perPerson: 0.025 },
    //   { name: "Milk", unit: "liters", dishes: ["tea", "coffee", "curd rice"], perPerson: 0.2 },
    //   { name: "Eggs", unit: "pieces", dishes: ["boiled egg", "omelette"], perPerson: 1 },
    //   { name: "Chicken", unit: "kg", dishes: ["chicken curry", "chicken biryani"], perPerson: 0.15 },
    //   { name: "Fish", unit: "kg", dishes: ["fish curry", "fish fry"], perPerson: 0.15 },
    //   { name: "Paneer", unit: "kg", dishes: ["paneer butter masala", "paneer tikka"], perPerson: 0.1 }
    // ];
    

    const ingredients = [
      { name: "Rice", unit: "kg", dishes: ["fried rice", "biryani", "curd rice"], perPerson: 0.18 },  // ~180g cooked rice
      { name: "Wheat Flour", unit: "kg", dishes: ["roti", "paratha"], perPerson: 0.12 }, // ~120g flour for 2 rotis
      { name: "Potato", unit: "kg", dishes: ["aloo curry", "samosa", "potato fry"], perPerson: 0.08 }, // ~80g
      { name: "Onion", unit: "kg", dishes: ["all dishes"], perPerson: 0.05 }, // ~50g per person across dishes
      { name: "Tomato", unit: "kg", dishes: ["all dishes"], perPerson: 0.04 }, // ~40g
      { name: "Milk", unit: "liters", dishes: ["tea", "coffee", "curd rice"], perPerson: 0.25 }, // 250ml
      { name: "Eggs", unit: "pieces", dishes: ["boiled egg", "omelette"], perPerson: 1 }, // 1 egg
      { name: "Chicken", unit: "kg", dishes: ["chicken curry", "chicken biryani"], perPerson: 0.18 }, // ~180g raw
      { name: "Fish", unit: "kg", dishes: ["fish curry", "fish fry"], perPerson: 0.18 }, // ~180g raw
      { name: "Paneer", unit: "kg", dishes: ["paneer butter masala", "paneer tikka"], perPerson: 0.12 } // ~120g
    ];
    

    await ingredientsCol.insertMany(ingredients);
    console.log("🎉 Ingredients seeded successfully.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding ingredients:", err);
    process.exit(1);
  }
})();
