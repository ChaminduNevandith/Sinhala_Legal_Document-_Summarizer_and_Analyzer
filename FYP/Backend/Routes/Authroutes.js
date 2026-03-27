const express = require("express");
const router = express.Router();
const { signup, login, logout, me, updateProfile, changePassword } = require("../Controllers/Authcontroller");

// POST /api/auth/signup
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", me);

// Settings
router.put("/profile", updateProfile);
router.put("/password", changePassword);

module.exports = router;
