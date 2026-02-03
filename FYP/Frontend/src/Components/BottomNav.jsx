import React from "react";

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-[#101822]/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800">
      <div className="flex justify-around items-center h-16 max-w-6xl mx-auto pb-[env(safe-area-inset-bottom)]">
        <button className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined">home</span>
          <span className="text-[10px] font-bold">මුල් පිටුව</span>
        </button>

        <button className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500">
          <span className="material-symbols-outlined">folder</span>
          <span className="text-[10px] font-bold">ලේඛනාගාරය</span>
        </button>

        <button className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500">
          <span className="material-symbols-outlined">help</span>
          <span className="text-[10px] font-bold">උදව්</span>
        </button>

        <button className="flex flex-col items-center gap-1 text-slate-400 dark:text-slate-500">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-[10px] font-bold">සැකසුම්</span>
        </button>
      </div>
    </nav>
  );
}
