
import React from "react";
import Sidebar from "../Components/Sidebar.jsx";
import TopAppBar from "../Components/TopAppBar.jsx";

export default function Help() {
	return (
		<div className="min-h-screen text-slate-900 dark:bg-background-dark dark:text-slate-100">
			<TopAppBar onNotificationsClick={() => {}} />

			<div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 pb-24 pt-6 lg:grid-cols-[260px_1fr] lg:pb-10">
				<aside className="hidden lg:sticky lg:top-22 lg:block lg:h-[calc(100vh-88px)]">
					<Sidebar />
				</aside>

				<main className="space-y-6">
					<div className="rounded-2xl border border-slate-200 bg-[#1c2027] p-5 shadow-sm dark:border-slate-800 dark:bg-surface-dark">
						<h3 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
							Help & Guidance
						</h3>
						<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
							How to upload, view summaries, and read legal analysis.
						</p>
					</div>
					<div className="space-y-4">
						<details className="rounded-2xl border border-slate-200 bg-[#1c2027] p-5 shadow-sm dark:border-slate-800 dark:bg-surface-dark">
							<summary className="flex cursor-pointer list-none items-center justify-between text-base font-bold text-slate-900 dark:text-white">
								1) Upload a document
								<span className="material-symbols-outlined text-slate-400">expand_more</span>
							</summary>
							<ul className="mt-4 space-y-3 text-sm text-slate-200">
								<li className="rounded-xl border border-blue-800 bg-[#1c2027] px-4 py-3 dark:border-slate-800 dark:bg-background-dark">
									Go to <b>Home</b> and click <b>Upload New Document</b>.
								</li>
								<li className="rounded-xl border border-blue-800 bg-[#1c2027] px-4 py-3 dark:border-slate-800 dark:bg-background-dark">
									Select a <b>PDF</b> or <b>DOCX</b> file and upload.
								</li>
								<li className="rounded-xl border border-blue-800 bg-[#1c2027] px-4 py-3 dark:border-slate-800 dark:bg-background-dark">
									Wait until processing completes; the summary will appear in your recent documents.
								</li>
							</ul>
						</details>

						<details className="rounded-2xl border border-slate-200 bg-[#1c2027] p-5 shadow-sm dark:border-slate-800 dark:bg-surface-dark">
							<summary className="flex cursor-pointer list-none items-center justify-between text-base font-bold text-slate-900 dark:text-white">
								2) View summary & preview
								<span className="material-symbols-outlined text-slate-400">expand_more</span>
							</summary>
							<ul className="mt-4 space-y-3 text-sm text-slate-200">
								<li className="rounded-xl border border-blue-800 bg-[#1c2027] px-4 py-3 dark:border-slate-800 dark:bg-background-dark">
									On <b>Home</b> or <b>History</b>, click a document card to open it.
								</li>
								<li className="rounded-xl border border-blue-800 bg-[#1c2027] px-4 py-3 dark:border-slate-800 dark:bg-background-dark">
									If it is a PDF, you will see an in-app preview; otherwise you can download.
								</li>
								<li className="rounded-xl border border-blue-800 bg-[#1c2027] px-4 py-3 dark:border-slate-800 dark:bg-background-dark">
									Read the <b>Summary</b> panel on the right.
								</li>
							</ul>
						</details>

						<details className="rounded-2xl border border-slate-200 bg-[#1c2027] p-5 shadow-sm dark:border-slate-800 dark:bg-surface-dark">
							<summary className="flex cursor-pointer list-none items-center justify-between text-base font-bold text-slate-900 dark:text-white">
								3) Understand legal analysis
								<span className="material-symbols-outlined text-slate-400">expand_more</span>
							</summary>
							<ul className="mt-4 space-y-3 text-sm text-slate-200">
								<li className="rounded-xl border border-blue-800 bg-[#1c2027] px-4 py-3 dark:border-slate-800 dark:bg-background-dark">
									<b>Rights</b>: what you are allowed to do or receive.
								</li>
								<li className="rounded-xl border border-blue-800 bg-[#1c2027] px-4 py-3 dark:border-slate-800 dark:bg-background-dark">
									<b>Obligations</b>: what you must do (duties/requirements).
								</li>
								<li className="rounded-xl border border-blue-800 bg-[#1c2027] px-4 py-3 dark:border-slate-800 dark:bg-background-dark">
									<b>Deadlines</b>: dates/time limits that appear in the document.
								</li>
								<li className="rounded-xl border border-blue-800 bg-[#1c2027] px-4 py-3 dark:border-slate-800 dark:bg-background-dark">
									<b>Risks</b>: potential issues, penalties, or problem areas.
								</li>
							</ul>
							<p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
								Note: This analysis is AI-assisted and should be reviewed by a qualified professional.
							</p>
						</details>

						<details className="rounded-2xl border border-slate-200 bg-[#1c2027] p-5 shadow-sm dark:border-slate-800 dark:bg-surface-dark">
							<summary className="flex cursor-pointer list-none items-center justify-between text-base font-bold text-slate-900 dark:text-white">
								4) History filters
								<span className="material-symbols-outlined text-slate-400">expand_more</span>
							</summary>
							<ul className="mt-4 space-y-3 text-sm text-slate-200">
								<li className="rounded-xl border border-blue-800 bg-[#1c2027] px-4 py-3 dark:border-slate-800 dark:bg-background-dark">
									Use the <b>search</b> box to filter by document name.
								</li>
								<li className="rounded-xl border border-blue-800 bg-[#1c2027] px-4 py-3 dark:border-slate-800 dark:bg-background-dark">
									Use <b>From</b> and <b>To</b> dates to filter documents in a range.
								</li>
							</ul>
						</details>

						<details className="rounded-2xl border border-slate-200 bg-[#1c2027] p-5 shadow-sm dark:border-slate-800 dark:bg-surface-dark">
							<summary className="flex cursor-pointer list-none items-center justify-between text-base font-bold text-slate-900 dark:text-white">
								Troubleshooting
								<span className="material-symbols-outlined text-slate-400">expand_more</span>
							</summary>
							<ul className="mt-4 space-y-3 text-sm text-slate-200">
								<li className="rounded-xl border border-blue-800 bg-[#1c2027] px-4 py-3 dark:border-slate-800 dark:bg-background-dark">
									If you can’t see documents, make sure you are logged in.
								</li>
								<li className="rounded-xl border border-blue-800 bg-[#1c2027] px-4 py-3 dark:border-slate-800 dark:bg-background-dark">
									If preview doesn’t load, try downloading the file instead.
								</li>
								<li className="rounded-xl border border-blue-800 bg-[#1c2027] px-4 py-3 dark:border-slate-800 dark:bg-background-dark">
									If analysis is empty, the document may not contain those sections.
								</li>
							</ul>
						</details>
					</div>
				</main>
			</div>
		</div>
	);
}

