const express = require("express");
const router = express.Router();
const { getRecentDocuments, getAllDocuments, getTotalDocuments } = require("../Controllers/Documents");
const { requireAuth } = require("../Controllers/UploadDocumentcontroller");

//Get recent documents for the logged in user
router.get("/recent", requireAuth, getRecentDocuments);

//Get total document count for the logged-in user
router.get("/total", requireAuth, getTotalDocuments);

//Get all documents for the logged-in user
router.get("/all", requireAuth, getAllDocuments);

module.exports = router;
