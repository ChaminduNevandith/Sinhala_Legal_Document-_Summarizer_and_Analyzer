import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import Sidebar from "../Components/Sidebar.jsx";
import DocCard from "../Components/DocCard.jsx";
import Modal from "../Components/Modal.jsx";
import TopAppBar from "../Components/TopAppBar.jsx";

export default function History() {
	const navigate = useNavigate();
	const [docs, setDocs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [user, setUser] = useState(null);
	const [today, setToday] = useState("");
	const [openDoc, setOpenDoc] = useState(null);

	const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

	const handleLogout = async () => {
		try {
			await client.post("/api/auth/logout");
			navigate("/login", { replace: true });
		} catch (err) {
			console.error("Logout failed:", err?.message || err);
		}
	};

	useEffect(() => {
		let mounted = true;
		async function fetchAllDocs() {
			setLoading(true);
			setError(null);
			try {
				const res = await client.get("/api/getdocuments/all");
				if (mounted) setDocs(res.data.documents || []);
			} catch (err) {
				if (mounted) setError(err.message || "Failed to load documents");
			} finally {
				if (mounted) setLoading(false);
			}
		}
		async function fetchUser() {
			try {
				const res = await client.get("/api/auth/me");
				if (mounted) setUser(res.data.user);
			} catch {
				if (mounted) setUser(null);
			}
		}
		function getToday() {
			const d = new Date();
			return d.toLocaleDateString("en-CA");
		}

		fetchAllDocs();
		fetchUser();
		setToday(getToday());
		return () => {
			mounted = false;
		};
	}, []);

	return (
		<div className="min-h-screen text-slate-900 dark:bg-background-dark dark:text-slate-100">
			<TopAppBar
				title={user ? `Welcome, ${user.name}` : "History"}
				subtitle={today ? `Today's date: ${today}` : ""}
				onNotificationsClick={() => {}}
				onLogoutClick={handleLogout}
			/>

			<div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 pb-24 pt-6 lg:grid-cols-[260px_1fr] lg:pb-10">
				<aside className="hidden lg:sticky lg:top-22 lg:block lg:h-[calc(100vh-88px)]">
					<Sidebar />
				</aside>

				<main className="space-y-4">
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
							All Documents
						</h3>
						<button
							type="button"
							onClick={() => navigate("/upload")}
							className="flex h-10 items-center justify-center gap-2 rounded-xl bg-[#1c2027] px-4 text-sm font-bold text-white"
						>
							<span className="material-symbols-outlined text-lg">add_circle</span>
							Upload
						</button>
					</div>

					<div className="space-y-3">
						{loading ? (
							<div className="text-center text-slate-500 dark:text-slate-400">Loading...</div>
						) : error ? (
							<div className="text-center text-red-500">{error}</div>
						) : docs.length === 0 ? (
							<div className="text-center text-slate-500 dark:text-slate-400">No documents found.</div>
						) : (
							docs.map((doc) => (
								<DocCard key={doc.id} doc={doc} onViewSummary={() => setOpenDoc(doc)} />
							))
						)}
					</div>

					<Modal open={!!openDoc} onClose={() => setOpenDoc(null)}>
						{openDoc && (
							<div className="flex flex-col md:flex-row w-full h-[80vh]">
								<div className="flex-1 min-w-75 bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-auto">
									{String(openDoc.mimeType || "").includes("pdf") ||
									String(openDoc.title || "").toLowerCase().endsWith(".pdf") ? (
										<iframe
											key={openDoc.id}
											title={openDoc.title || "Document"}
											className="h-full w-full"
											src={`${apiBaseUrl}/api/documents/${openDoc.id}/file`}
										/>
									) : (
										<div className="text-center text-slate-500 px-6">
											Preview not available for this file type.
											<div className="mt-2 text-xs">({openDoc.title})</div>
											<a
												className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/20"
												href={`${apiBaseUrl}/api/documents/${openDoc.id}/file`}
												target="_blank"
												rel="noreferrer"
											>
												Download
											</a>
										</div>
									)}
								</div>
								<div className="flex-1 min-w-75 p-6 overflow-auto">
									<h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Summary</h2>
									<div className="mb-4 text-slate-700 dark:text-slate-200 whitespace-pre-line">
										{openDoc.summary || "No summary available."}
									</div>

									<h3 className="text-lg font-semibold mt-4 mb-1 text-slate-900 dark:text-white">Details</h3>
									<div className="text-sm text-slate-600 dark:text-slate-300">
										<div>
											<b>File Name:</b> {openDoc.title}
										</div>
										<div>
											<b>Uploaded:</b> {openDoc.meta}
										</div>
									</div>
								</div>
							</div>
						)}
					</Modal>
				</main>
			</div>
		</div>
	);
}
