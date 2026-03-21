// Get total document count for a user
async function getTotalDocuments(req, res) {
	try {
		const userId = req.user?.id;
		if (!userId) return res.status(401).json({ message: "Not authenticated." });
		const rows = await query(
			`SELECT COUNT(*) AS total FROM documents WHERE user_id = ?`,
			[userId]
		);
		return res.json({ total: rows[0]?.total || 0 });
	} catch (err) {
		console.error("Get total documents error:", err.message);
		return res.status(500).json({ message: "Internal server error." });
	}
}
const { query } = require("../DB/db");

// Get all documents for a user uploaded within the last 7 days
async function getRecentDocuments(req, res) {
	try {
		const userId = req.user?.id;
		if (!userId) return res.status(401).json({ message: "Not authenticated." });

		// Get documents from the last 7 days
		const docs = await query(
			`SELECT id, name, mime_type, size, created_at, summary
			 FROM documents
			 WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
			 ORDER BY created_at DESC`,
			[userId]
		);

		// Add status and icon for frontend compatibility
		const mapped = docs.map((doc) => ({
			id: doc.id,
			title: doc.name,
			meta: `${doc.created_at.toISOString().slice(0, 10)} • ${(doc.size / (1024 * 1024)).toFixed(1)} MB`,
			status: "ready", // You can adjust this if you have a processing state
			icon: "description", // Or choose based on mime_type
			summary: doc.summary || null,
		}));

		return res.json({ documents: mapped });
	} catch (err) {
		console.error("Get recent documents error:", err.message);
		return res.status(500).json({ message: "Internal server error." });
	}
}

module.exports = { getRecentDocuments, getTotalDocuments };
