const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  },
  breakfast: { type: String, required: true },
  lunch: { type: String, required: true },
  dinner: { type: String, required: true }
});

const Menu = mongoose.model("menuitem", menuSchema);

const getMenu = async function () {
  const menuItems = await Menu.find({}).select({ _id: 0 });

  const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  menuItems.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));

  return menuItems;
};

const setMenus = async function (menus) {
  // ensure days are lowercase
  const formattedMenus = menus.map(m => ({
    day: m.day.toLowerCase(),
    breakfast: m.breakfast,
    lunch: m.lunch,
    dinner: m.dinner
  }));

  await Menu.deleteMany({});
  await Menu.insertMany(formattedMenus);
};

module.exports = {
  Menu,
  getMenu,
  setMenus
};
