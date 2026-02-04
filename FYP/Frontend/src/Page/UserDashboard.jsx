import React from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import SidebarItem from "../Components/SidebarItem.jsx";
import StatCard from "../Components/StatCard.jsx";
import DocCard from "../Components/DocCard.jsx";
import BottomNavItem from "../Components/BottomNavItem.jsx";
import TopAppBar from "../Components/TopAppBar.jsx";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await client.post("/api/auth/logout");
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err?.message || err);
    }
  };
  const recentDocs = [
    {
      id: 1,
      title: "ඉඩම් ඔප්පුව - අංක 452",
      meta: "2023 ඔක්තෝබර් 12 • 1.2 MB",
      status: "ready",
      icon: "description",
    },
    {
      id: 2,
      title: "රැකියා ගිවිසුම - 2024",
      meta: "මීට සුළු මොහොතකට පෙර",
      status: "processing",
      icon: "sync",
    },
    {
      id: 3,
      title: "කුලී ගිවිසුම - මොරටුව",
      meta: "2023 සැප්තැම්බර් 28",
      status: "ready",
      icon: "gavel",
    },
  ];

  return (
    <div className="min-h-screen  text-slate-900 dark:bg-background-dark dark:text-slate-100">
      {/* Top App Bar */}
      <TopAppBar
        title="ආයුබෝවන්, අමිල"
        subtitle="අද දිනය: ඔක්තෝබර් 24"
        avatarUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuBt-RmcjepGTTtxHmbkNM6QwQ4qvX6kU9SXXkSKY_EkVJjBHcfZRQqNP_I3otZrh1W-kq5SsVVZdrLLW4javun_4_Ht7BkJ-Qcif4zlBSrRf1CV9y-btLr201_wBUwY1J8QRLIvE_tyvMHJLxB7KYCmTfeAlBViGpkSHtW9IxDyjG3wZhMy4u3g4BMumOOPGnPOMB0RXM2Lqi4-KP1oSLgjgX_LFiLUoY8hHEq8N_oVhY8qawaQa8YEzsOlLAHfe6uKnqVNfc2596k"
        onNotificationsClick={() => {
          // TODO: Hook into notifications panel when implemented
          console.log("Notifications clicked");
        }}
        onLogoutClick={handleLogout}
      />

      {/* Page Layout */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 pb-24 pt-6 lg:grid-cols-[260px_1fr_320px] lg:pb-10">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:sticky lg:top-[88px] lg:block lg:h-[calc(100vh-88px)]">
          <div className="rounded-2xl border border-slate-200 bg-[#1c2027] p-4 shadow-sm dark:border-slate-800 dark:bg-surface-dark">
            <nav className="space-y-2">
              <SidebarItem active icon="home" label="මුල් පිටුව" />
              <SidebarItem icon="folder" label="ලේඛනාගාරය" />
              <SidebarItem icon="help" label="උදව්" />
              <SidebarItem icon="settings" label="සැකසුම්" />
            </nav>
          </div>
        </aside>

        {/* Main */}
        <main className="space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard
              title="මුළු ලේඛන"
              value="12"
              icon="description"
              valueClassName="text-slate-900 dark:text-white"
              iconClassName="text-primary"
            />
            <StatCard
              title="අවදානම්"
              value="05"
              icon="warning"
              valueClassName="text-red-500"
              iconClassName="text-red-500"
            />
          </div>

          {/* CTA */}
          <button className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#1c2027] px-5 text-base font-bold text-white shadow-lg shadow-primary/20 transition-transform active:scale-95">
            <span className="material-symbols-outlined">add_circle</span>
            <span>නව ලේඛනයක් එක් කරන්න</span>
          </button>

          {/* Section Header */}
          <div className="flex items-center justify-between ">
            <h3 className="text-lg font-bold leading-tight tracking-tight text-slate-900  dark:text-white">
              මෑතකාලීන ලේඛන
            </h3>
            <button className="text-sm font-semibold text-primary bg-[#1c2027]">සියල්ල බලන්න</button>
          </div>

          {/* Document List */}
          <div className="space-y-3">
            {recentDocs.map((doc) => (
              <DocCard key={doc.id} doc={doc} />
            ))}
          </div>
        </main>

        {/* Right Panel (Desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-[88px] space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-[#1c2027] p-4 shadow-sm dark:border-slate-800 dark:bg-surface-dark">
              <p className="text-sm font-semibold  text-slate-900 dark:text-white">
                Quick Actions
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 ">
                <SmallAction icon="upload" label="Upload" />
                <SmallAction icon="search" label="Search" />
                <SmallAction icon="history" label="History" />
                <SmallAction icon="shield" label="Privacy" />

              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[#1c2027] p-4 shadow-sm dark:border-slate-800 dark:bg-surface-dark">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                Notifications
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                No new notifications.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 border-t  border-slate-200 bg-[#1c2027] backdrop-blur-xl dark:border-slate-800 dark:bg-background-dark/90 lg:hidden">
        <div className="mx-auto flex h-16 max-w-md items-center justify-around pb-safe-area">
          <BottomNavItem active icon="home" label="මුල් පිටුව" />
          <BottomNavItem icon="folder" label="ලේඛනාගාරය" />
          <BottomNavItem icon="help" label="උදව්" />
          <BottomNavItem icon="settings" label="සැකසුම්" />
        </div>
      </nav>

      {/* Safe area padding for iOS */}
      <style>{`
        .pb-safe-area { padding-bottom: env(safe-area-inset-bottom); }
      `}</style>
    </div>
  );
}

function SmallAction({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-[#232831] px-3 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-background-dark dark:text-slate-200 dark:hover:bg-slate-800">
      <span className="material-symbols-outlined text-lg">{icon}</span>
      {label}
    </button>
  );
}

