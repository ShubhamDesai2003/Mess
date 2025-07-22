// const mongoose = require("mongoose");

// const MenuSchema = mongoose.model("menuitem", new mongoose.Schema({
//     day: String,
//     breakfast: String,
//     lunch: String,
//     dinner: String
// }));


// // Get the weekly menu
// // module.exports.getMenu = async function () {
// //     const menuItems = await MenuSchema.find({})
// //         .select({ _id: 0 });
// //     return menuItems;
// // }

// module.exports.getMenu = async function () {
//     const menuItems = await MenuSchema.find({})
//         .select({ _id: 0 });

//     const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

//     // Sort manually by day name
//     menuItems.sort((a, b) => {
//         return dayOrder.indexOf(a.day.toLowerCase()) - dayOrder.indexOf(b.day.toLowerCase());
//     });

//     return menuItems;
// }


// // Set the weekly menu
// module.exports.setMenus = async function (menus) {
//     await MenuSchema.deleteMany({});
//     await MenuSchema.insertMany(menus);
// }



const mongoose = require("mongoose");

// Step 1: Define the Schema
const menuSchema = new mongoose.Schema({
  day: { type: String, required: true },
  breakfast: String,
  lunch: String,
  dinner: String
});

// Step 2: Create the model
const Menu = mongoose.model("menuitem", menuSchema);  // ✅ schema passed correctly

// Step 3: Add utility functions
const getMenu = async function () {
  const menuItems = await Menu.find({}).select({ _id: 0 });

  const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  menuItems.sort((a, b) => {
    return dayOrder.indexOf(a.day.toLowerCase()) - dayOrder.indexOf(b.day.toLowerCase());
  });

  return menuItems;
};

const setMenus = async function (menus) {
  await Menu.deleteMany({});
  await Menu.insertMany(menus);
};

// Step 4: Export everything
module.exports = {
  Menu,      // ✅ Export the actual model
  getMenu,
  setMenus
};
