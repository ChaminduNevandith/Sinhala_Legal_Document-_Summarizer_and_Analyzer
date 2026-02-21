import React from "react";

export default function TopAppBar({
	title = "ආයුබෝවන්, අමිල",
	subtitle = "අද දිනය: ඔක්තෝබර් 24",
	avatarUrl = "https://lh3.googleusercontent.com/aida-public/AB6AXuBt-RmcjepGTTtxHmbkNM6QwQ4qvX6kU9SXXkSKY_EkVJjBHcfZRQqNP_I3otZrh1W-kq5SsVVZdrLLW4javun_4_Ht7BkJ-Qcif4zlBSrRf1CV9y-btLr201_wBUwY1J8QRLIvE_tyvMHJLxB7KYCmTfeAlBViGpkSHtW9IxDyjG3wZhMy4u3g4BMumOOPGnPOMB0RXM2Lqi4-KP1oSLgjgX_LFiLUoY8hHEq8N_oVhY8qawaQa8YEzsOlLAHfe6uKnqVNfc2596k",
	onNotificationsClick,
	onLogoutClick,
	className = "",
}) {
	return (
		<header
			className={
				`sticky top-0 inset-x-0 w-full z-50 border-b border-slate-200 bg-[#1d1d1d] backdrop-blur-md dark:border-slate-800 dark:bg-background-dark/80 ` +
				className
			}
		>
			<div className="flex w-full items-center justify-between px-4 py-4">
				<div className="flex items-center gap-3">
					<div
						className="size-10 shrink-0 overflow-hidden rounded-full border-2 border-primary/20 bg-cover bg-center"
						style={{ backgroundImage: `url("${avatarUrl}")` }}
					/>
					<div className="flex flex-col">
						<h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
							{title}
						</h2>
						{subtitle && (
							<p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
						)}
					</div>
				</div>

				<div className="flex items-center gap-2">
					<button
						className="flex size-10 items-center justify-center rounded-full transition-colors hover:bg-slate-200 dark:hover:bg-slate-800"
						onClick={onNotificationsClick}
						aria-label="Notifications"
					>
						<span className="material-symbols-outlined text-slate-600 dark:text-slate-300">
							notifications
						</span>
					</button>
					<button
						className="flex h-10 items-center gap-2 rounded-full border border-slate-200 bg-[#1c2027] px-3 text-sm font-semibold text-white transition-colors hover:bg-slate-900 dark:border-slate-800"
						onClick={onLogoutClick}
						aria-label="Logout"
					>
						<span className="material-symbols-outlined text-base">logout</span>
						<span>Log Out</span>
					</button>
				</div>
			</div>
		</header>
	);
}

