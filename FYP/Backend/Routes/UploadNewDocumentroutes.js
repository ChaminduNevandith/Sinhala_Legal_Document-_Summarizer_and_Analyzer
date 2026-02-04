const express = require("express");
const router = express.Router();
const multer = require("multer");
const { requireAuth, uploadDocument } = require("../Controllers/UploadDocumentcontroller");

// Multer setup: memory storage to encrypt before persisting
const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
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

// POST /api/documents/upload
router.post("/upload", requireAuth, upload.single("file"), uploadDocument);

module.exports = router;
