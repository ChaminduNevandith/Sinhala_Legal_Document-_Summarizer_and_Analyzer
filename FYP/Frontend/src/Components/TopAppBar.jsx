import React from "react";

export default function TopAppBar({ userName, todayLabel }) {
  return (
    <header className="sticky top-0 z-50 bg-[#f6f7f8]/80 dark:bg-[#101822]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div
            className="size-10 shrink-0 rounded-full overflow-hidden border-2 border-primary/20 bg-cover bg-center"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBt-RmcjepGTTtxHmbkNM6QwQ4qvX6kU9SXXkSKY_EkVJjBHcfZRQqNP_I3otZrh1W-kq5SsVVZdrLLW4javun_4_Ht7BkJ-Qcif4zlBSrRf1CV9y-btLr201_wBUwY1J8QRLIvE_tyvMHJLxB7KYCmTfeAlBViGpkSHtW9IxDyjG3wZhMy4u3g4BMumOOPGnPOMB0RXM2Lqi4-KP1oSLgjgX_LFiLUoY8hHEq8N_oVhY8qawaQa8YEzsOlLAHfe6uKnqVNfc2596k")',
            }}
            aria-label="User profile"
          />
          <div className="flex flex-col">
            <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
              ආයුබෝවන්, {userName}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">අද දිනය: {todayLabel}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex size-10 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
            <span className="material-symbols-outlined text-slate-600 dark:text-slate-300">notifications</span>
          </button>
        </div>
      </div>
    </header>
  );
}
