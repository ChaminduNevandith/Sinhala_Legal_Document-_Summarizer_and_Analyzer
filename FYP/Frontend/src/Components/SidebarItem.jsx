
function SidebarItem({ icon, label, active }) {
  return (
    <button
      className={[
        "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
      ].join(" ")}
    >
      <span className={["material-symbols-outlined", active ? "fill-[1]" : ""].join(" ")}>
        {icon}
      </span>
      <span className="text-sm font-bold">{label}</span>
    </button>
  );
}

export default SidebarItem;