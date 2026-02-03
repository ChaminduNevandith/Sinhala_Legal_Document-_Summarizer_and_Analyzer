import React from "react";
import StatusPill from "./StatusPill";

export default function DocumentCard({ doc }) {
  return (
    <div
      className={`flex flex-col bg-white dark:bg-[#1c2531] rounded-xl border border-slate-100 dark:border-slate-800 p-4 shadow-sm ${
        doc.status === "processing" ? "opacity-90" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex gap-3">
          <div
            className={[
              "flex items-center justify-center rounded-lg shrink-0 size-12",
              doc.status === "processing"
                ? "bg-amber-500/10 text-amber-500"
                : "bg-primary/10 text-primary",
            ].join(" ")}
          >
            <span
              className={[
                "material-symbols-outlined",
                doc.status === "processing" ? "animate-pulse" : "",
              ].join(" ")}
            >
              {doc.icon}
            </span>
          </div>

          <div className="flex flex-col">
            <h4 className="text-slate-900 dark:text-white text-base font-bold leading-snug">{doc.title}</h4>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{doc.meta}</p>
          </div>
        </div>

        <StatusPill status={doc.status} />
      </div>

      {doc.status === "processing" ? (
        <div className="flex gap-2">
          <button
            className="flex-1 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 text-sm font-bold cursor-not-allowed flex items-center justify-center gap-1"
            disabled
          >
            වෙලාව අවශ්‍යයි...
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <button className="flex-1 h-10 rounded-lg bg-primary/10 text-primary text-sm font-bold hover:bg-primary/20 transition-colors flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-lg">auto_awesome</span>
            සාරාංශය
          </button>
          <button className="flex-1 h-10 rounded-lg bg-red-500/10 text-red-500 text-sm font-bold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1">
            <span className="material-symbols-outlined text-lg">report_problem</span>
            අවදානම්
          </button>
        </div>
      )}
    </div>
  );
}
