const express = require("express");
const router = express.Router();
const { signup } = require("../Controllers/Authcontroller");

// POST /api/auth/signup
router.post("/signup", signup);

module.exports = router;
