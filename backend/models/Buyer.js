const mongoose = require("mongoose");

const BuyerSchema = new mongoose.Schema({
  email: String,
  secret: String,
  bought: Boolean,
  this: createWeekSchema(),
  next: createWeekSchema()
});

function createWeekSchema() {
  const mealSchema = {
    breakfast: { type: Boolean, default: false },
    lunch: { type: Boolean, default: false },
    dinner: { type: Boolean, default: false }
  };

  return {
    monday: mealSchema,
    tuesday: mealSchema,
    wednesday: mealSchema,
    thursday: mealSchema,
    friday: mealSchema,
    saturday: mealSchema,
    sunday: mealSchema
  };
}

const Buyer = mongoose.model("buyer", BuyerSchema);

// --- GET or CREATE a buyer ---
module.exports.getBuyer = async function (email) {
  const randomStr = generateRandomSecret();
  const buyerDoc = await Buyer.findOneAndUpdate(
    { email },
    {
      $setOnInsert: {
        bought: false,
        secret: randomStr,
        this: createEmptyWeek(),
        next: createEmptyWeek()
      }
    },
    { new: true, upsert: true }
  ).select({ _id: 0 });

  return buyerDoc;
};

// --- Reset buyer secret ---
module.exports.resetSecret = async function (email) {
  const newSecret = generateRandomSecret();
  const updatedBuyer = await Buyer.findOneAndUpdate(
    { email },
    { secret: newSecret },
    { new: true }
  ).select({ _id: 0 });

  return updatedBuyer;
};

// --- Check if coupon is valid ---
module.exports.checkCoupon = async function (data) {
  const buyer = await Buyer.findOne({ email: data.email, secret: data.secret });
  if (!buyer) return false;

  if (buyer.this[data.day]?.[data.type]) {
    await Buyer.updateOne(
      { email: data.email },
      { $set: { [`this.${data.day}.${data.type}`]: false } }
    );
    return true;
  }
  return false;
};

// --- Save purchase selection ---
module.exports.saveOrder = async function (email, selectedMeals) {
  await Buyer.updateOne(
    { email },
    {
      $set: {
        this: selectedMeals,
        bought: true
      }
    },
    { upsert: true }
  );
};

// --- Check if buyer bought for next week ---
module.exports.boughtNextWeek = async function (email) {
  await module.exports.getBuyer(email);
  const buyer = await Buyer.findOne({ email });
  return buyer?.bought || false;
};

// --- Get all buyers ---
module.exports.allBuyers = async function () {
  const all = await Buyer.find({});
  return all;
};

// --- Export the model ---
module.exports.Buyer = Buyer;

// --- Helper functions ---
function generateRandomSecret() {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789";
  let str = "";
  for (let i = 0; i < 4; i++) str += charset[Math.floor(Math.random() * charset.length)];
  return str;
}

function createEmptyWeek() {
  return {
    monday: { breakfast: false, lunch: false, dinner: false },
    tuesday: { breakfast: false, lunch: false, dinner: false },
    wednesday: { breakfast: false, lunch: false, dinner: false },
    thursday: { breakfast: false, lunch: false, dinner: false },
    friday: { breakfast: false, lunch: false, dinner: false },
    saturday: { breakfast: false, lunch: false, dinner: false },
    sunday: { breakfast: false, lunch: false, dinner: false }
  };
}
