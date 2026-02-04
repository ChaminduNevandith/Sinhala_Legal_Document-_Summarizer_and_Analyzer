const { query } = require("../DB/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const TOKEN_COOKIE = process.env.COOKIE_NAME || "token";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"; // e.g., '1d', '7d'

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
async function login(req, res) {
	try {
		const { email, password } = req.body || {};
		if (!email || !password) {
			return res.status(400).json({ message: "Email and password are required." });
		}

		const rows = await query("SELECT id, name, email, password_hash FROM users WHERE email = ? LIMIT 1", [email]);
		if (!rows || rows.length === 0) {
			return res.status(401).json({ message: "Invalid email or password." });
		}
		const user = rows[0];
		const match = await bcrypt.compare(password, user.password_hash);
		if (!match) {
			return res.status(401).json({ message: "Invalid email or password." });
		}

		const payload = { sub: user.id, email: user.email, name: user.name };
		const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

		const isProd = process.env.NODE_ENV === "production";
		res.cookie(TOKEN_COOKIE, token, {
			httpOnly: true,
			secure: isProd, // set true under HTTPS
			sameSite: isProd ? "none" : "lax",
			maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
		});

		return res.json({
			message: "Login successful.",
			user: { id: user.id, name: user.name, email: user.email }
		});
	} catch (err) {
		console.error("Login error:", err.message);
		return res.status(500).json({ message: "Internal server error." });
	}
}

async function logout(req, res) {
	try {
		const isProd = process.env.NODE_ENV === "production";
		res.clearCookie(TOKEN_COOKIE, {
			httpOnly: true,
			secure: isProd,
			sameSite: isProd ? "none" : "lax"
		});
		return res.json({ message: "Logged out." });
	} catch (err) {
		return res.status(500).json({ message: "Internal server error." });
	}
}

module.exports = { signup, login, logout };
