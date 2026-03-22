const express = require("express");
const router = express.Router();
const { getRecentDocuments, getAllDocuments, getTotalDocuments } = require("../Controllers/Documents");
const { requireAuth } = require("../Controllers/UploadDocumentcontroller");

// GET /api/documents/recent - Get recent documents for the logged-in user
router.get("/recent", requireAuth, getRecentDocuments);

// GET /api/documents/total - Get total document count for the logged-in user
router.get("/total", requireAuth, getTotalDocuments);

// GET /api/getdocuments/all - Get all documents for the logged-in user
router.get("/all", requireAuth, getAllDocuments);

module.exports = router;
