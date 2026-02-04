function DocCard({ doc }) {
  const isProcessing = doc.status === "processing";
  const isReady = doc.status === "ready";

  return (
    <div
      className={[
        "flex flex-col rounded-xl border border-slate-100 bg-[#1c2027] p-4 shadow-sm dark:border-slate-800 dark:bg-surface-dark",
        isProcessing ? "opacity-90" : "",
      ].join(" ")}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div
            className={[
              "flex size-12 shrink-0 items-center justify-center rounded-lg",
              isProcessing
                ? "bg-amber-500/10 text-amber-500"
                : "bg-primary/10 text-primary",
            ].join(" ")}
          >
            <span
              className={[
                "material-symbols-outlined",
                isProcessing ? "animate-pulse" : "",
              ].join(" ")}
            >
              {doc.icon}
            </span>
          </div>

          <div className="flex flex-col">
            <h4 className="text-base font-bold leading-snug text-slate-900 dark:text-white">
              {doc.title}
            </h4>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{doc.meta}</p>
          </div>
        </div>

        {/* Status pill */}
        {isReady ? (
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-emerald-500">
            <div className="size-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">සූදානම්</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-amber-500">
            <div className="size-2 animate-pulse rounded-full bg-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider">සැකසෙමින්</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {isProcessing ? (
          <button
            className="flex h-10 flex-1 cursor-not-allowed items-center justify-center gap-1 rounded-lg bg-slate-100 text-sm font-bold text-slate-400 dark:bg-slate-800"
            disabled
          >
            වෙලාව අවශ්‍යයි...
          </button>
        ) : (
          <>
            <button className="flex h-10 flex-1 items-center justify-center gap-1 rounded-lg bg-primary/10 text-sm font-bold text-primary transition-colors hover:bg-primary/20">
              <span className="material-symbols-outlined text-lg">auto_awesome</span>
              සාරාංශය
            </button>
            <button className="flex h-10 flex-1 items-center justify-center gap-1 rounded-lg bg-red-500/10 text-sm font-bold text-red-500 transition-colors hover:bg-red-500/20">
              <span className="material-symbols-outlined text-lg">report_problem</span>
              අවදානම්
            </button>
          </>
        )}
      </div>
    </div>
  );
}
export default DocCard;