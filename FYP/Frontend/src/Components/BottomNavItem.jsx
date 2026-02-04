import React from "react";

function BottomNavItem({ icon, label, active }) {
  return (
    <button
      className={[
        "flex flex-col items-center gap-1",
        active ? "text-primary" : "text-slate-400 dark:text-slate-500",
      ].join(" ")}
    >
      <span className={["material-symbols-outlined", active ? "fill-[1]" : ""].join(" ")}>
        {icon}
      </span>
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

export default BottomNavItem;