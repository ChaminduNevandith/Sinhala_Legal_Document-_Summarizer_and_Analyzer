import React, { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar.jsx";
import TopAppBar from "../Components/TopAppBar.jsx";
import client from "../api/client";

export default function Settings() {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);

	const [name, setName] = useState("");
	const [email, setEmail] = useState("");

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	useEffect(() => {
		let mounted = true;
		(async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await client.get("/api/auth/me");
				const u = res.data?.user;
				if (mounted) {
					setName(u?.name || "");
					setEmail(u?.email || "");
				}
			} catch (e) {
				if (mounted) setError(e?.message || "Failed to load user.");
			} finally {
				if (mounted) setLoading(false);
			}
		})();
		return () => {
			mounted = false;
		};
	}, []);

	const clearMessages = () => {
		setError(null);
		setSuccess(null);
	};

	const handleUpdateProfile = async (e) => {
		e.preventDefault();
		clearMessages();
		try {
			const res = await client.put("/api/auth/profile", { name, email });
			setSuccess(res.data?.message || "Profile updated.");
		} catch (err) {
			setError(err?.response?.data?.message || err?.message || "Failed to update profile.");
		}
	};

	const handleChangePassword = async (e) => {
		e.preventDefault();
		clearMessages();
		if (newPassword !== confirmPassword) {
			setError("New password and confirmation do not match.");
			return;
		}
		try {
			const res = await client.put("/api/auth/password", { currentPassword, newPassword });
			setSuccess(res.data?.message || "Password updated.");
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
		} catch (err) {
			setError(err?.response?.data?.message || err?.message || "Failed to update password.");
		}
	};

	return (
		<div className="min-h-screen text-slate-900 dark:bg-background-dark dark:text-slate-100">
			<TopAppBar title="Settings" onNotificationsClick={() => {}} />

			<div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 pb-24 pt-6 lg:grid-cols-[260px_1fr] lg:pb-10">
				<aside className="hidden lg:sticky lg:top-22 lg:block lg:h-[calc(100vh-88px)]">
					<Sidebar />
				</aside>

				<main className="space-y-6">
					<div className="rounded-2xl border border-slate-200 bg-[#1c2027] p-5 shadow-sm dark:border-slate-800 dark:bg-surface-dark">
						<h3 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
							Account
						</h3>
						<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
							Update your personal details and password.
						</p>

						{loading ? (
							<div className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading...</div>
						) : (
							<>
								{error && <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>}
								{success && <div className="mt-4 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">{success}</div>}
							</>
						)}
					</div>

					<section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
						<form
							onSubmit={handleUpdateProfile}
							className="rounded-2xl border border-slate-200 bg-[#1c2027] p-5 shadow-sm dark:border-slate-800 dark:bg-surface-dark"
						>
							<h4 className="text-base font-bold text-slate-900 dark:text-white">Personal details</h4>
							<div className="mt-4 space-y-3">
								<div>
									<label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Name</label>
									<input
										value={name}
										onChange={(e) => setName(e.target.value)}
										className="h-12 w-full rounded-xl border border-blue-800 bg-[#1c2027] px-4 text-sm font-medium text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-800 dark:bg-background-dark"
										required
									/>
								</div>
								<div>
									<label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Email</label>
									<input
										type="email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										className="h-12 w-full rounded-xl border border-blue-800 bg-[#1c2027] px-4 text-sm font-medium text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-800 dark:bg-background-dark"
										required
									/>
								</div>
							</div>
							<button
								type="submit"
								className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-[#1c2027] text-sm font-bold text-white shadow-lg shadow-primary/20 transition-transform active:scale-95"
							>
								Save changes
							</button>
						</form>

						<form
							onSubmit={handleChangePassword}
							className="rounded-2xl border border-slate-200 bg-[#1c2027] p-5 shadow-sm dark:border-slate-800 dark:bg-surface-dark"
						>
							<h4 className="text-base font-bold text-slate-900 dark:text-white">Password</h4>
							<div className="mt-4 space-y-3">
								<div>
									<label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Current password</label>
									<input
										type="password"
										value={currentPassword}
										onChange={(e) => setCurrentPassword(e.target.value)}
										className="h-12 w-full rounded-xl border border-blue-800 bg-[#1c2027] px-4 text-sm font-medium text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-800 dark:bg-background-dark"
										required
									/>
								</div>
								<div>
									<label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">New password</label>
									<input
										type="password"
										value={newPassword}
										onChange={(e) => setNewPassword(e.target.value)}
										className="h-12 w-full rounded-xl border border-blue-800 bg-[#1c2027] px-4 text-sm font-medium text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-800 dark:bg-background-dark"
										required
										minLength={6}
									/>
								</div>
								<div>
									<label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Confirm new password</label>
									<input
										type="password"
										value={confirmPassword}
										onChange={(e) => setConfirmPassword(e.target.value)}
										className="h-12 w-full rounded-xl border border-blue-800 bg-[#1c2027] px-4 text-sm font-medium text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-800 dark:bg-background-dark"
										required
										minLength={6}
									/>
								</div>
							</div>
							<button
								type="submit"
								className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-[#1c2027] text-sm font-bold text-white shadow-lg shadow-primary/20 transition-transform active:scale-95"
							>
								Update password
							</button>
						</form>
					</section>
				</main>
			</div>
		</div>
	);
}

