// Import required modules
const express = require("express");
const passport = require("passport");
const router = express.Router();

// Signin button link
router.get(
    "/signin",
    (req, res, next) => {
         // Debugging log
        next();  // Proceed with authentication
    },
    passport.authenticate(
        "google",
        {
            prompt: "select_account",
            scope: ["profile", "email"]
        }
    )
);

router.get(
    "/signout",
    (req, res, next) => {
        // Call req.logout and provide a callback function to handle errors
        req.logout(function (err) {
            if (err) {
                return next(err);  // Pass the error to the next middleware
            }
            res.redirect(process.env.FRONTEND);  // Redirect to frontend after successful logout
        });
    }
);


router.get('/google/callback', passport.authenticate('google', { failureRedirect: process.env.FRONTEND }),
    (req, res) => {
        // Call req.login() to establish a session
        req.login(req.user, (err) => {
            if (err) {
                console.error('Error during login:', err);
                return res.redirect(process.env.FRONTEND);
            }
            // Redirect after successful login
            res.redirect(process.env.FRONTEND);
        });
    }
);


module.exports = router;