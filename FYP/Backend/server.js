const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
require("dotenv").config();

// Test route
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "Backend is running" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
