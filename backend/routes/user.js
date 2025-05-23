// Import required modules
const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");

// Import database models
const Buyer = require("../models/Buyer");
const Time = require("../models/Time");
const Order = require("../models/Order");

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

module.exports = router;
