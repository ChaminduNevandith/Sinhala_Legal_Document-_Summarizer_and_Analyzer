const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const { initDatabase, query } = require("./DB/db");

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Auth routes
const authRoutes = require("./Routes/Authroutes");
app.use("/api/auth", authRoutes);

// Document upload routes
const uploadDocumentRoutes = require("./Routes/UploadNewDocumentroutes");
app.use("/api/documents", uploadDocumentRoutes);

// Document retrieval routes
const documentsRoutes = require("./Routes/Documentsroutes");
app.use("/api/getdocuments", documentsRoutes);

// Initialize database connection
initDatabase()
  .then(() => console.log("DB connection initialized"))
  .catch((e) => console.error("DB init failed:", e.message));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
