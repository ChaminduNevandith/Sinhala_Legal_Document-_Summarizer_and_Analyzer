const express = require("express");
const router = express.Router();
const { signup, login, logout, me, updateProfile, changePassword } = require("../Controllers/Authcontroller");

// Sign up routes
router.post("/signup", signup);

// Login routes
router.post("/login", login);

// Logout routes
router.post("/logout", logout);

// Get user details
router.get("/me", me);

// Settings
router.put("/profile", updateProfile);

// Change password
router.put("/password", changePassword);

module.exports = router;
