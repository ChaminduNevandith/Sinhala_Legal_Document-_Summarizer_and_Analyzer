const { query } = require("../DB/db");
const bcrypt = require("bcryptjs");

async function signup(req, res) {
	try {
		const { name, email, password } = req.body || {};

		// Basic validation
		if (!name || !email || !password) {
			return res.status(400).json({ message: "Name, email, and password are required." });
		}
		if (typeof password !== "string" || password.length < 6) {
			return res.status(400).json({ message: "Password must be at least 6 characters." });
		}

		// Check if user already exists
		const existing = await query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
		if (existing && existing.length > 0) {
			return res.status(409).json({ message: "An account with this email already exists." });
		}

		// Hash password
		const salt = await bcrypt.genSalt(10);
		const passwordHash = await bcrypt.hash(password, salt);

		// Insert user
		const result = await query(
			"INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, NOW())",
			[name, email, passwordHash]
		);

		return res.status(201).json({
			message: "Account created successfully.",
			user: { id: result.insertId, name, email }
		});
	} catch (err) {
		console.error("Signup error:", err.message);
		return res.status(500).json({ message: "Internal server error." });
	}
}

module.exports = { signup };
