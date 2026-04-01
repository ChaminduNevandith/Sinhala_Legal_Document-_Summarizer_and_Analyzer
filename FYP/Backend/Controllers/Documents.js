const crypto = require("crypto");
const { query } = require("../DB/db");

// 32-byte key in base64
const ENC_KEY_B64 = process.env.DOC_ENCRYPTION_KEY || ""; 

// Helper to get encryption key buffer
function getEncryptionKey() {
	if (!ENC_KEY_B64) throw new Error("DOC_ENCRYPTION_KEY not configured.");
	const key = Buffer.from(ENC_KEY_B64, "base64");
	if (key.length !== 32) throw new Error("DOC_ENCRYPTION_KEY must be 32 bytes (AES-256) in base64.");
	return key;
}

// Decrypt document buffer using AES-256-GCM
function decryptDocument(encryptedBuffer, iv, authTag) {
	const key = getEncryptionKey();
	const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
	decipher.setAuthTag(authTag);
	return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
}

// Helper to send buffer with support for Range requests 
function sendBufferWithRange(req, res, buffer, { contentType, fileName }) {
	res.setHeader("Content-Type", contentType);
	res.setHeader("Content-Disposition", `inline; filename=\"${String(fileName || "document").replace(/\"/g, "") }\"`);
	res.setHeader("Accept-Ranges", "bytes");

	const range = req.headers.range;
	if (!range) {
		res.setHeader("Content-Length", buffer.length);
		return res.status(200).send(buffer);
	}

	const match = /^bytes=(\d*)-(\d*)$/.exec(range);
	if (!match) return res.status(416).send("Invalid Range");

	const total = buffer.length;
	let start = match[1] === "" ? 0 : Number(match[1]);
	let end = match[2] === "" ? total - 1 : Number(match[2]);

	if (Number.isNaN(start) || Number.isNaN(end) || start < 0 || end < 0 || start >= total) {
		res.setHeader("Content-Range", `bytes */${total}`);
		return res.status(416).end();
	}
	if (end >= total) end = total - 1;
	if (end < start) {
		res.setHeader("Content-Range", `bytes */${total}`);
		return res.status(416).end();
	}

	const chunk = buffer.slice(start, end + 1);
	res.status(206);
	res.setHeader("Content-Range", `bytes ${start}-${end}/${total}`);
	res.setHeader("Content-Length", chunk.length);
	return res.send(chunk);
}


// Get total document count for a user
async function getTotalDocuments(req, res) {
	try {
		const userId = req.user?.id;
		if (!userId) return res.status(401).json({ message: "Not authenticated." });
		const rows = await query(
			`SELECT COUNT(*) AS total FROM documents WHERE user_id = ?`,
			[userId]
		);

		const riskRows = await query(
			`SELECT risks FROM documents WHERE user_id = ?`,
			[userId]
		);

		let riskAssessments = 0;
		for (const row of riskRows || []) {
			const raw = row?.risks;
			if (!raw) continue;
			if (typeof raw === "string") {
				const trimmed = raw.trim();
				if (!trimmed || trimmed === "[]" || trimmed === "null") continue;
				try {
					const parsed = JSON.parse(trimmed);
					if (Array.isArray(parsed) && parsed.length > 0) riskAssessments += 1;
					else if (!Array.isArray(parsed) && parsed) riskAssessments += 1;
				} catch {
					riskAssessments += 1;
				}
			} else {
				riskAssessments += 1;
			}
		}
		return res.json({ total: rows[0]?.total || 0, riskAssessments });
	} catch (err) {
		console.error("Get total documents error:", err.message);
		return res.status(500).json({ message: "Internal server error." });
	}
}

// Get recent documents for a user last 7 days
async function getRecentDocuments(req, res) {
	try {
		const userId = req.user?.id;
		if (!userId) return res.status(401).json({ message: "Not authenticated." });

		const docs = await query(
			`SELECT id, name, mime_type, size, created_at, summary, rights, obligations, deadlines, risks
			 FROM documents
			 WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
			 ORDER BY created_at DESC`,
			[userId]
		);

		const mapped = docs.map((doc) => ({
			id: doc.id,
			title: doc.name,
			mimeType: doc.mime_type,
			createdAt: doc.created_at ? doc.created_at.toISOString() : null,
			meta: `${doc.created_at.toISOString().slice(0, 10)} • ${(doc.size / (1024 * 1024)).toFixed(1)} MB`,
			status: "ready", // You can adjust this if you have a processing state
			icon: "description", // Or choose based on mime_type
			summary: doc.summary || null,
			analysis: {
				rights: doc.rights ? JSON.parse(doc.rights) : [],
				obligations: doc.obligations ? JSON.parse(doc.obligations) : [],
				deadlines: doc.deadlines ? JSON.parse(doc.deadlines) : [],
				risks: doc.risks ? JSON.parse(doc.risks) : []
			}
		}));

		return res.json({ documents: mapped });
	} catch (err) {
		console.error("Get recent documents error:", err.message);
		return res.status(500).json({ message: "Internal server error." });
	}
}

// Get all documents for a user History 
async function getAllDocuments(req, res) {
	try {
		const userId = req.user?.id;
		if (!userId) return res.status(401).json({ message: "Not authenticated." });

		const docs = await query(
			`SELECT id, name, mime_type, size, created_at, summary, rights, obligations, deadlines, risks
			 FROM documents
			 WHERE user_id = ?
			 ORDER BY created_at DESC`,
			[userId]
		);

		const mapped = (docs || []).map((doc) => ({
			id: doc.id,
			title: doc.name,
			mimeType: doc.mime_type,
			createdAt: doc.created_at ? doc.created_at.toISOString() : null,
			meta: `${doc.created_at.toISOString().slice(0, 10)} • ${(doc.size / (1024 * 1024)).toFixed(1)} MB`,
			status: "ready",
			icon: "description",
			summary: doc.summary || null,
			analysis: {
				rights: doc.rights ? JSON.parse(doc.rights) : [],
				obligations: doc.obligations ? JSON.parse(doc.obligations) : [],
				deadlines: doc.deadlines ? JSON.parse(doc.deadlines) : [],
				risks: doc.risks ? JSON.parse(doc.risks) : []
			}
		}));

		return res.json({ documents: mapped });
	} catch (err) {
		console.error("Get all documents error:", err.message);
		return res.status(500).json({ message: "Internal server error." });
	}
}

// Get document details by ID without file data
async function getDocumentById(req, res) {
	try {
		const userId = req.user?.id;
		if (!userId) return res.status(401).json({ message: "Not authenticated." });

		const docId = Number(req.params.id);
		if (!docId) return res.status(400).json({ message: "Invalid document id." });

		const rows = await query(
			"SELECT id, user_id, name, mime_type, size, created_at, doc_type, query_text, summary, rights, obligations, deadlines, risks FROM documents WHERE id = ? AND user_id = ? LIMIT 1",
			[docId, userId]
		);
		if (!rows || rows.length === 0) return res.status(404).json({ message: "Document not found." });

		const doc = rows[0];
		return res.json({ 
			document: {
				...doc,
				createdAt: doc.created_at ? doc.created_at.toISOString() : null,
				analysis: {
					rights: doc.rights ? JSON.parse(doc.rights) : [],
					obligations: doc.obligations ? JSON.parse(doc.obligations) : [],
					deadlines: doc.deadlines ? JSON.parse(doc.deadlines) : [],
					risks: doc.risks ? JSON.parse(doc.risks) : []
				}
			}
		});
	} catch (err) {
		console.error("Get document by id error:", err.message);
		return res.status(500).json({ message: "Internal server error." });
	}
}

// Get document file data by ID with decryption
async function getDocumentFile(req, res) {
	try {
		const userId = req.user?.id;
		if (!userId) return res.status(401).json({ message: "Not authenticated." });

		const docId = Number(req.params.id);
		if (!docId) return res.status(400).json({ message: "Invalid document id." });

		const rows = await query(
			"SELECT id, user_id, name, mime_type, data, iv, auth_tag FROM documents WHERE id = ? AND user_id = ? LIMIT 1",
			[docId, userId]
		);
		if (!rows || rows.length === 0) return res.status(404).json({ message: "Document not found." });

		const doc = rows[0];
		let decrypted;
		try {
			decrypted = decryptDocument(doc.data, doc.iv, doc.auth_tag);
		} catch (e) {
			const msg = String(e && e.message);
			if (msg.includes("DOC_ENCRYPTION_KEY")) {
				return res.status(500).json({ message: "Encryption key not configured on server." });
			}
			console.error("Decrypt document error:", msg);
			return res.status(500).json({ message: "Failed to decrypt document." });
		}

		let contentType = doc.mime_type || "application/octet-stream";
		const lower = String(doc.name || "").toLowerCase();
		if (lower.endsWith(".pdf")) contentType = "application/pdf";
		if (lower.endsWith(".docx")) contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

		return sendBufferWithRange(req, res, decrypted, { contentType, fileName: doc.name });
	} catch (err) {
		console.error("Get document file error:", err.message);
		return res.status(500).json({ message: "Internal server error." });
	}
}

module.exports = { getRecentDocuments, getAllDocuments, getTotalDocuments, getDocumentFile, getDocumentById };
