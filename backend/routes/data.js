// Import required modules
const express = require("express");
const router = express.Router();

// Import database models
const Menu = require('../models/Menu');
const Time = require('../models/Time');

// Get the weekly menu
router.get(
    "/menu",
    async (req, res) => {
        console.log("menu done");
        res.send(await Menu.getMenu());
    }
);

// Get the time and cost of breakfast, lunch, dinner
router.get(
    "/time",
    async (req, res) => {
        console.log("time done", Time.getTimes());
        res.send(await Time.getTimes());
    }
);

// Get the logged in and admin status
router.get(
    "/status",
    async (req, res) => {
        console.log({loggedIn: req.isAuthenticated()});
        res.send({ loggedIn: req.isAuthenticated(), admin: (req.isAuthenticated() && req.user?.email === process.env.ADMIN) });
    }
);

module.exports = router;