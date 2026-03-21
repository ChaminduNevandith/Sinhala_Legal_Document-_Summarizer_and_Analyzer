const express = require("express");
const router = express.Router();
const multer = require("multer");
const { requireAuth, uploadDocument } = require("../Controllers/UploadDocumentcontroller");
const { getDocumentFile } = require("../Controllers/Documents");
const { query } = require("../DB/db");

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

// GET /api/documents/:id
router.get("/:id", requireAuth, async (req, res) => {
	try {
		const userId = req.user?.id;
		const rows = await query(
			"SELECT id, user_id, name, mime_type, size, created_at, doc_type, summary FROM documents WHERE id = ? AND user_id = ? LIMIT 1",
			[req.params.id, userId]
		);
		if (!rows || rows.length === 0) return res.status(404).json({ message: "Document not found" });
		res.json({ document: rows[0] });
	} catch (e) {
		res.status(500).json({ message: "Failed to fetch document" });
	}
});

// GET /api/documents/:id/file - stream decrypted file (PDF inline)
router.get("/:id/file", requireAuth, getDocumentFile);

module.exports = router;
