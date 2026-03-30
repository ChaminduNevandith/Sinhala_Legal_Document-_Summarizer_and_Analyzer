const express = require("express");
const router = express.Router();
const multer = require("multer");
const { requireAuth, uploadDocument } = require("../Controllers/UploadDocumentcontroller");
const { getDocumentById, getDocumentFile } = require("../Controllers/Documents");

// Multer configuration for file uploads
const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
	fileFilter: (req, file, cb) => {
		const allowed = [
			"application/pdf",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		];
		const isAllowed = allowed.includes(file.mimetype) ||
			(file.originalname && [".pdf", ".docx"].some(ext => file.originalname.toLowerCase().endsWith(ext)));
		if (!isAllowed) return cb(new Error("Only PDF and DOCX files are allowed."));
		cb(null, true);
	},
});

//Upload a new document
router.post("/upload", requireAuth, upload.single("file"), uploadDocument);

//Get document details by ID
router.get("/:id", requireAuth, getDocumentById);

//stream decrypted file 
router.get("/:id/file", requireAuth, getDocumentFile);

module.exports = router;
