const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { initDatabase, query } = require("./DB/db");

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || true
}));
app.use(express.json());

// Routes
const authRoutes = require("./Routes/Authroutes");
app.use("/api/auth", authRoutes);

// Initialize DB 
initDatabase()
  .then(() => console.log("DB connection initialized"))
  .catch((e) => console.error("DB init failed:", e.message));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
