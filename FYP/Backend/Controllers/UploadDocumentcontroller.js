const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { query } = require("../DB/db");

const TOKEN_COOKIE = process.env.COOKIE_NAME || "token";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const ENC_KEY_B64 = process.env.DOC_ENCRYPTION_KEY || ""; // 32-byte key in base64

function getEncryptionKey() {
	if (!ENC_KEY_B64) throw new Error("DOC_ENCRYPTION_KEY not configured.");
	const key = Buffer.from(ENC_KEY_B64, "base64");
	if (key.length !== 32) throw new Error("DOC_ENCRYPTION_KEY must be 32 bytes (AES-256) in base64.");
	return key;
}

async function ensureDocumentsTable() {
	await query(
		`CREATE TABLE IF NOT EXISTS documents (
			id INT AUTO_INCREMENT PRIMARY KEY,
			user_id INT NOT NULL,
			name VARCHAR(255) NOT NULL,
			mime_type VARCHAR(100) NOT NULL,
			size BIGINT NOT NULL,
			iv VARBINARY(16) NOT NULL,
			auth_tag VARBINARY(16) NOT NULL,
			data LONGBLOB NOT NULL,
			doc_type VARCHAR(50) NULL,
			query_text TEXT NULL,
			created_at DATETIME NOT NULL,
			INDEX (user_id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
	);
}

function requireAuth(req, res, next) {
	try {
		const token = req.cookies?.[TOKEN_COOKIE];
		if (!token) return res.status(401).json({ message: "Not authenticated." });
		let payload;
		try {
			payload = jwt.verify(token, JWT_SECRET);
		} catch (err) {
			return res.status(401).json({ message: "Invalid or expired token." });
		}
		req.user = { id: payload.sub, email: payload.email, name: payload.name };
		next();
	} catch (err) {
		return res.status(500).json({ message: "Auth middleware error." });
	}
}

async function uploadDocument(req, res) {
	try {
		await ensureDocumentsTable();

		const userId = req.user?.id;
		if (!userId) return res.status(401).json({ message: "Not authenticated." });

		const file = req.file;
		if (!file) return res.status(400).json({ message: "No file uploaded." });

		// Validate type (safety net, also in multer)
		const isPdf = file.mimetype === "application/pdf" || file.originalname.toLowerCase().endsWith(".pdf");
		const isDocx = file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || file.originalname.toLowerCase().endsWith(".docx");
		if (!isPdf && !isDocx) return res.status(400).json({ message: "Only PDF and DOCX files are allowed." });

		const { doc_type, query_text } = req.body || {};

		// Encrypt file content with AES-256-GCM
		const key = getEncryptionKey();
		const iv = crypto.randomBytes(12); // GCM recommended 12-byte IV
		const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
		const encrypted = Buffer.concat([cipher.update(file.buffer), cipher.final()]);
		const authTag = cipher.getAuthTag();

		// Insert into DB
		const sql = `INSERT INTO documents (user_id, name, mime_type, size, iv, auth_tag, data, doc_type, query_text, created_at)
								 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;
		const params = [
			userId,
			file.originalname,
			file.mimetype,
			file.size,
			iv,
			authTag,
			encrypted,
			doc_type || null,
			query_text || null,
		];
		const result = await query(sql, params);

		return res.status(201).json({
			message: "Document uploaded securely.",
			document: {
				id: result.insertId,
				name: file.originalname,
				mime_type: file.mimetype,
				size: file.size,
				created_at: new Date().toISOString(),
			}
		});
	} catch (err) {
		console.error("Upload error:", err.message);
		if (String(err.message || "").includes("DOC_ENCRYPTION_KEY")) {
			return res.status(500).json({ message: "Encryption key not configured on server." });
		}
		return res.status(500).json({ message: "Internal server error." });
	}
}

module.exports = { requireAuth, uploadDocument };
