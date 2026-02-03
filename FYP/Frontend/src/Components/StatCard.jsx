import React from "react";

export default function StatCard({ label, value, icon, valueClass = "" }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl p-4 bg-white dark:bg-[#1c2531] shadow-sm border border-slate-100 dark:border-slate-800">
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{label}</p>
      <div className="flex items-end justify-between">
        <p className={`text-3xl font-bold leading-none ${valueClass}`}>{value}</p>
        <span className="material-symbols-outlined text-xl text-primary">{icon}</span>
      </div>
    </div>
  );
}
