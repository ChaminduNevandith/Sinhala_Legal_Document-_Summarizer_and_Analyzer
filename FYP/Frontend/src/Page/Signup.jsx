import React, { useState } from "react";
import GavelIcon from "@mui/icons-material/Gavel";
import LoginIcon from "@mui/icons-material/Login";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";

export default function Signup() {
	const navigate = useNavigate();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [loading, setLoading] = useState(false);

	// API base handled via axios client

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSuccess("");
		if (password !== confirm) {
			setError("Passwords do not match.");
			return;
		}
		if (!name || !email || !password) {
			setError("Please fill all required fields.");
			return;
		}
		try {
			setLoading(true);
			await client.post("/api/auth/signup", { name, email, password });
			setSuccess("Account created! You can now sign in.");
			setTimeout(() => navigate("/login"), 800);
		} catch (err) {
			setError(err?.message || "Network error. Please check your connection.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="dark min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white flex flex-col">
			{/* Top Navigation Bar */}
			<header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
				<div className="flex items-center justify-between px-4 py-4 w-full">
					<div className="flex items-center gap-2">
						<div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
							<GavelIcon style={{ color: "white", fontSize: 24 }} />
						</div>
						<h2 className="text-lg font-bold tracking-tight">Sinhala Legal AI</h2>
					</div>

					<Link
						to="/login"
						className="text-white font-semibold text-base px-4 py-2 flex items-center gap-1 rounded-[5px]"
						style={{ background: "linear-gradient(135deg, #2b7cee22 0%, #2b7cee 100%)" }}
					>
						<LoginIcon fontSize="small" />
						Login
					</Link>
				</div>
			</header>

			{/* Main content */}
			<main className="flex-1 w-full pb-36">
				<section className="px-6 pt-10 pb-8">
					<div className="max-w-md mx-auto bg-white dark:bg-[#121212] rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 p-6">
						<h1 className="text-2xl font-bold mb-2 text-slate-900 dark:text-white text-center">Create your account</h1>
						<p className="text-slate-600 dark:text-slate-400 text-center mb-6">Join Sinhala Legal AI</p>

						{error && (
							<div className="mb-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-lg p-3">
								{error}
							</div>
						)}
						{success && (
							<div className="mb-4 text-sm text-green-700 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900 rounded-lg p-3">
								{success}
							</div>
						)}

						<form onSubmit={handleSubmit} className="flex flex-col gap-4">
							<div className="flex flex-col gap-2">
								<label className="text-sm text-slate-700 dark:text-slate-300">Name</label>
								<input
									type="text"
									value={name}
									onChange={(e) => setName(e.target.value)}
									className="w-full px-3 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
									placeholder="Jane Doe"
								/>
							</div>

							<div className="flex flex-col gap-2">
								<label className="text-sm text-slate-700 dark:text-slate-300">Email</label>
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className="w-full px-3 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
									placeholder="you@example.com"
									required
								/>
							</div>

							<div className="flex flex-col gap-2">
								<label className="text-sm text-slate-700 dark:text-slate-300">Password</label>
								<input
									type="password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className="w-full px-3 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
									placeholder="••••••••"
									required
								/>
							</div>

							<div className="flex flex-col gap-2">
								<label className="text-sm text-slate-700 dark:text-slate-300">Confirm Password</label>
								<input
									type="password"
									value={confirm}
									onChange={(e) => setConfirm(e.target.value)}
									className="w-full px-3 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1a1a1a] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
									placeholder="••••••••"
									required
								/>
							</div>

							<button
								type="submit"
								disabled={loading}
								className="w-full bg-[#1a1a1a] hover:bg-[#1a1a1a]/90 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
							>
								{loading ? "Creating..." : "Create Account"}
							</button>

							<div className="text-center text-sm text-slate-600 dark:text-slate-400">
								Already have an account?{" "}
								<Link to="/login" className="text-primary font-semibold">Sign in</Link>
							</div>
						</form>
					</div>
				</section>
			</main>
		</div>
	);
}

