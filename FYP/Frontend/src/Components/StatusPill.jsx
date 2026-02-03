import React from "react";

export default function StatusPill({ status }) {
  if (status === "processing") {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
        <div className="size-2 rounded-full bg-amber-500 animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-wider">සැකසෙමින්</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
      <div className="size-2 rounded-full bg-emerald-500" />
      <span className="text-[10px] font-bold uppercase tracking-wider">සූදානම්</span>
    </div>
  );
}
