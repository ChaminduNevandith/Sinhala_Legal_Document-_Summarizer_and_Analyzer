const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { query } = require("../DB/db");
const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

// Constants
const TOKEN_COOKIE = process.env.COOKIE_NAME || "token";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const ENC_KEY_B64 = process.env.DOC_ENCRYPTION_KEY || ""; // 32-byte key in base64

// Helper to normalize uploaded filenames handle encoding issues
function normalizeUploadedFilename(name) {
	const input = String(name || "");
	if (!input) return input;

	try {
		const decoded = Buffer.from(input, "latin1").toString("utf8");
		const roundTrip = Buffer.from(decoded, "utf8").toString("latin1");
		if (roundTrip === input) return decoded;
	} catch {
		// ignore
	}
	return input;
}

// Helper to get encryption key buffer
function getEncryptionKey() {
	if (!ENC_KEY_B64) throw new Error("DOC_ENCRYPTION_KEY not configured.");
	const key = Buffer.from(ENC_KEY_B64, "base64");
	if (key.length !== 32) throw new Error("DOC_ENCRYPTION_KEY must be 32 bytes (AES-256) in base64.");
	return key;
}

// Ensure documents table exists with necessary columns
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
			-- optional summary of the document
			summary LONGTEXT NULL,
			-- legal analysis fields
			rights JSON NULL,
			obligations JSON NULL,
			deadlines JSON NULL,
			risks JSON NULL,
			INDEX (user_id)
		) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
	);

	// Ensure summary column
	try {
		await query("ALTER TABLE documents ADD COLUMN summary LONGTEXT NULL");
	} catch (e) {
		const msg = String(e && e.message);
		if (!msg.includes("Duplicate column") && !msg.includes("ER_DUP_FIELDNAME")) {
			console.error("Failed to ensure summary column:", msg);
		}
	}

	// Ensure legal analysis columns (if not exist)
	const analysisColumns = ["rights", "obligations", "deadlines", "risks"];
	for (const col of analysisColumns) {
		try {
			await query(`ALTER TABLE documents ADD COLUMN ${col} JSON NULL`);
		} catch (e) {
			const msg = String(e && e.message);
			if (!msg.includes("Duplicate column") && !msg.includes("ER_DUP_FIELDNAME")) {
				console.error(`Failed to ensure ${col} column:`, msg);
			}
		}
	}
}

// Get authenticated user details from JWT token in cookie
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

// uploadDocument: Handle file upload, encrypt and store in DB, then summarize and analyze
async function uploadDocument(req, res) {
	try {
		await ensureDocumentsTable();

		const userId = req.user?.id;
		if (!userId) return res.status(401).json({ message: "Not authenticated." });

		const file = req.file;
		if (!file) return res.status(400).json({ message: "No file uploaded." });

		const originalName = normalizeUploadedFilename(file.originalname);

		const isPdf = file.mimetype === "application/pdf" || originalName.toLowerCase().endsWith(".pdf");
		const isDocx = file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" || originalName.toLowerCase().endsWith(".docx");
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
			originalName,
			file.mimetype,
			file.size,
			iv,
			authTag,
			encrypted,
			doc_type || null,
			query_text || null,
		];
		const result = await query(sql, params);
		const tempDir = path.join(__dirname, "../FYP_models/tmp");
		if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
		const fileExtension = isPdf ? ".pdf" : ".docx";
		const safeFilename = `temp_${Date.now()}${fileExtension}`;
		const tempFilePath = path.join(tempDir, safeFilename);
		fs.writeFileSync(tempFilePath, file.buffer);
		let fileType = null;
		if (isPdf) fileType = "pdf";
		else if (isDocx) fileType = "docx";
		let summary = null;
		let extractedText = null;
		try {
			const result = await summarizeDocument(tempFilePath, fileType);
			summary = result.summary;
			extractedText = result.extractedText;
		} catch (e) {
			console.error("Summarization error:", e);
		}
		fs.unlinkSync(tempFilePath);

		if (summary) {
			try {
				await query("UPDATE documents SET summary = ? WHERE id = ?", [summary, result.insertId]);
			} catch (e) {
				console.error("Failed to save summary to DB:", e && e.message);
			}
		}

		let analysisResult = null;
		try {
			const textForAnalysis = extractedText || summary || "";
			analysisResult = await analyzeLegalDocument(textForAnalysis);
			if (analysisResult) {
				const { rights, obligations, deadlines, risks } = analysisResult;

				await query(
					"UPDATE documents SET rights = ?, obligations = ?, deadlines = ?, risks = ? WHERE id = ?",
					[
						JSON.stringify(rights || []),      
						JSON.stringify(obligations || []), 
						JSON.stringify(deadlines || []),   
						JSON.stringify(risks || []),       
						result.insertId
					]
				);
				console.log("Legal analysis saved for document:", result.insertId);
				console.log("Identified: Rights:", rights?.length || 0, "| Obligations:", obligations?.length || 0, "| Deadlines:", deadlines?.length || 0, "| Risks:", risks?.length || 0);
			}
		} catch (e) {
			console.error("Legal analysis error:", e);
		}

		return res.status(201).json({
			message: "Document uploaded securely.",
			document: {
				id: result.insertId,
				name: originalName,
				mime_type: file.mimetype,
				size: file.size,
				created_at: new Date().toISOString(),
				summary: summary || null,
				analysis: analysisResult || null
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

// Decrypt document data using AES-256-GCM
function decryptDocument(encryptedBuffer, iv, authTag) {
	const key = getEncryptionKey();
	const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
	decipher.setAuthTag(authTag);
	const decrypted = Buffer.concat([
		decipher.update(encryptedBuffer),
		decipher.final()
	]);
	return decrypted;
}

// Get document details by ID without file data
async function summarizeDocument(tempFilePath, fileType) {
	return new Promise((resolve, reject) => {
		const py = spawn("py", [
				path.join(__dirname, "../Script/summarize.py"),
		]);
		const input = JSON.stringify({ file_path: tempFilePath, file_type: fileType });
		let output = "";
		let error = "";
		py.stdin.write(input);
		py.stdin.end();
		py.stdout.on("data", (data) => { output += data.toString(); });
		py.stderr.on("data", (data) => { error += data.toString(); });
		py.on("close", (code) => {
			if (code !== 0) return reject(error || `Python exited with code ${code}`);
			try {
				const result = JSON.parse(output);
				if (result.summary) {
					resolve({
						summary: result.summary,
						extractedText: result.extracted_text || result.summary
					});
				}
				else reject(result.error || "No summary returned");
			} catch (e) { reject(e.message); }
		});
	});
}

// Analyze legal document text using FastAPI service
async function analyzeLegalDocument(text) {
	if (!text || text.trim().length === 0) return null;

	try {
		const https = require("https");
		const http = require("http");

		const fastApiUrl = new URL(process.env.FASTAPI_URL || "http://127.0.0.1:8000/analyze-legal");
		const isHttps = fastApiUrl.protocol === "https:";
		const client = isHttps ? https : http;

		const requestData = JSON.stringify({
			text: text,
			use_llm_refinement: true
		});

		return new Promise((resolve, reject) => {
			const options = {
				hostname: fastApiUrl.hostname,
				port: fastApiUrl.port || (isHttps ? 443 : 80),
				path: fastApiUrl.pathname,
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Content-Length": Buffer.byteLength(requestData)
				},
				timeout: 120000 
			};

			const req = client.request(options, (res) => {
				let data = "";
				res.on("data", (chunk) => { data += chunk; });
				res.on("end", () => {
					if (res.statusCode === 200) {
						try {
							const result = JSON.parse(data);
							resolve({
								rights: result.rights || [],
								obligations: result.obligations || [],
								deadlines: result.deadlines || [],
								risks: result.risks || []
							});
						} catch (e) {
							console.error("Failed to parse legal analysis response:", e.message);
							resolve(null);
						}
					} else {
						console.error(`FastAPI returned status ${res.statusCode}`);
						resolve(null);
					}
				});
			});

			req.on("error", (err) => {
				console.error("Legal analysis request error:", err.message);
				resolve(null);
			});

			req.on("timeout", () => {
				req.abort();
				console.error("Legal analysis request timeout");
				resolve(null);
			});

			req.write(requestData);
			req.end();
		});
	} catch (err) {
		console.error("analyzeLegalDocument error:", err.message);
		return null;
	}
}

module.exports = { requireAuth, uploadDocument };
