import React from "react";

export default function SidebarNav() {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:gap-3 lg:sticky lg:top-24 lg:self-start lg:w-64">
      <div className="rounded-2xl bg-white dark:bg-[#1c2531] border border-slate-100 dark:border-slate-800 shadow-sm p-4">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">මෙනුව</p>

        <div className="mt-3 space-y-2">
          <button className="w-full flex items-center gap-3 rounded-xl px-3 py-2 bg-primary/10 text-primary font-semibold">
            <span className="material-symbols-outlined">home</span>
            මුල් පිටුව
          </button>

          <button className="w-full flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold transition-colors">
            <span className="material-symbols-outlined">folder</span>
            ලේඛනාගාරය
          </button>

          <button className="w-full flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold transition-colors">
            <span className="material-symbols-outlined">help</span>
            උදව්
          </button>

          <button className="w-full flex items-center gap-3 rounded-xl px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold transition-colors">
            <span className="material-symbols-outlined">settings</span>
            සැකසුම්
          </button>
        </div>
      </div>
    </aside>
  );
}
