import React from "react";
import SidebarItem from "./SidebarItem.jsx";
import { useNavigate, useLocation } from "react-router-dom";

//initation of sidebar links with icons, labels, and paths for navigation.
const sidebarLinks = [
  { icon: "home", label: "Home", path: "/" },
  { icon: "folder", label: "History", path: "/history" },
  { icon: "help", label: "Help", path: "/help" },
  { icon: "settings", label: "Settings", path: "/settings" },
];

//Sidebar component that renders a vertical side bar menu
function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="rounded-2xl border border-slate-200 bg-[#1c2027] p-4 shadow-sm dark:border-slate-800 dark:bg-surface-dark">
      <nav className="space-y-2">
        {sidebarLinks.map((link) => (
          <SidebarItem
            key={link.label}
            icon={link.icon}
            label={link.label}
            active={location.pathname === link.path}
            onClick={() => navigate(link.path)}
          />
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;
