// Import required modules
const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");

// Import database models
const Buyer = require("../models/Buyer");
const Time = require("../models/Time");
const Order = require("../models/Order");

const Rating = require("../models/Rating");
const { Menu } = require("../models/Menu");


// Import RazorPay payment validator
var {
  validatePaymentVerification,
} = require("razorpay/dist/utils/razorpay-utils");

// Get the user secret and meals purchased
router.get("/data", async (req, res) => {
  console.log("Buyer:",Buyer.getBuyer(req.user?.email));

  res.send(await Buyer.getBuyer(req.user?.email));
});

// Reset the user secret
router.get("/resetSecret", async (req, res) => {
  res.send(await Buyer.resetSecret(req.user?.email));
});

// Check if the user's coupon is valid for the current day and meal
router.post("/checkCoupon", async (req, res) => {
  res.send(await Buyer.checkCoupon(req.body));
});

// Check if the user has already bought coupons for the next week
router.get("/boughtNextWeek", async (req, res) => {
  console.log("Buyer boughtNextWeek:",Buyer.boughtNextWeek(req.user.email));
  res.send(await Buyer.boughtNextWeek(req.user?.email));
});

// Check if the payment throught RazorPay is successful
router.post("/checkOrder", async (req, res) => {
  const isValid = validatePaymentVerification(
    {
      order_id: req.body.razorpay_order_id,
      payment_id: req.body.razorpay_payment_id,
    },
    req.body.razorpay_signature,
    process.env.PAY_SECRET
  );
  if (isValid) {
    const orderObj = await Order.getOrder(req.body.razorpay_order_id);
    await Buyer.saveOrder(req.user?.email, orderObj.selected);
  }
  res.send(isValid);
});

// Example usage in route handler
router.post("/createOrder", async (req, res) => {
  try {
    console.log("/createOrder:", req);
    // Validate request
    if (!req.user || !req.body.selected) {
      return res.status(400).json({ error: "Invalid request" });
    }

    console.log("order:")
    console.log(req.body.selected)

    // Create order
    const order = await Order.create({
      user: req.user._id,
      selected: req.body.selected,
      status: "completed",
    });

    // Update buyer
    await Buyer.saveOrder(req.user.email, order.selected);

    res.status(201).json({
      message: "Order created successfully",
      orderId: order._id,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      error: "Failed to create order",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

router.get("/getRating", async (req, res) => {
  const { day, mealType } = req.query;
  const email = req.user.email;

  if (!day || !mealType) {
    return res.status(400).json({ error: "day and mealType are required" });
  }

  try {
    const doc = await Rating.findOne({ email, day });
    if (!doc) {
      return res.json({ rating: 0 });
    }

    const meal = doc.meals.find(m => m.mealType === mealType);
    return res.json({ rating: meal ? meal.rating : 0 });
  } catch (err) {
    console.error("GetRating Error:", err);
    return res.status(500).json({ error: "Failed to fetch rating" });
  }
});




router.post("/rateMeal", async (req, res) => {
  const { day, mealType, rating } = req.body;
  const email = req.user.email;

    try {
    // Get dish name
    const todayMenu = await Menu.findOne({
      day: { $regex: new RegExp(`^${day}$`, "i") }
    });
    if (!todayMenu || !todayMenu[mealType]) {
      return res.status(404).json({ error: "Dish not found for this meal" });
    }

    const dishName = todayMenu[mealType];

    // Upsert day entry and update or push meal inside meals[]
    const updated = await Rating.findOneAndUpdate(
      { email, day },
      {
        $pull: { meals: { mealType } } // Remove old entry if exists
      },
      { new: true, upsert: true }
    );

    updated.meals.push({
      mealType,
      rating,
      dishName,
      createdAt: new Date()
    });

    await updated.save();

    return res.json({ success: true });
  } catch (err) {
    console.error("RateMeal Error:", err);
    return res.status(500).json({ error: "Failed to save rating" });
  }
});



module.exports = router;


// // server/routes/user.js
// const express = require("express");
// const router = express.Router();
// const Rating = require("../models/Rating");
// // ... other imports (Buyer, Order, etc.)

// // Existing routes here…

// /**
//  * @route   GET /api/user/getRating
//  * @desc    Retrieve the current user’s rating for a specific day & meal
//  * @access  Authenticated users
//  */
// router.get("/getRating", async (req, res) => {
//   const { day, mealType } = req.query;
//   const email = req.user.email;

//   if (!day || !mealType) {
//     return res.status(400).json({ error: "day and mealType are required" });
//   }

//   try {
//     const doc = await Rating.findOne({ email, day, mealType });
//     return res.json({ rating: doc ? doc.rating : 0 });
//   } catch (err) {
//     console.error("GetRating Error:", err);
//     return res.status(500).json({ error: "Failed to fetch rating" });
//   }
// });

// /**
//  * @route   POST /api/user/rateMeal
//  * @desc    Submit or update a meal rating (1–5 stars)
//  * @access  Authenticated users
//  */
// router.post("/rateMeal", async (req, res) => {
//   const { day, mealType, rating } = req.body;
//   const email = req.user.email;

//   if (!day || !mealType || typeof rating !== "number") {
//     return res.status(400).json({ error: "day, mealType and numeric rating required" });
//   }

//   try {
//     // upsert rating
//     await Rating.findOneAndUpdate(
//       { email, day, mealType },
//       { $set: { rating, createdAt: new Date() } },
//       { upsert: true, new: true }
//     );
//     return res.json({ success: true });
//   } catch (err) {
//     console.error("RateMeal Error:", err);
//     return res.status(500).json({ error: "Failed to save rating" });
//   }
// });

// module.exports = router;
