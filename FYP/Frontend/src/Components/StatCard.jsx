function StatCard({ title, value, icon, valueClassName, iconClassName }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-[#1c2027] p-4 shadow-sm dark:border-slate-800 dark:bg-surface-dark">
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
      <div className="flex items-end justify-between">
        <p className={["text-3xl font-bold leading-none", valueClassName].join(" ")}>
          {value}
        </p>
        <span className={["material-symbols-outlined text-xl", iconClassName].join(" ")}>
          {icon}
        </span>
      </div>
    </div>
  );
}

export default StatCard;