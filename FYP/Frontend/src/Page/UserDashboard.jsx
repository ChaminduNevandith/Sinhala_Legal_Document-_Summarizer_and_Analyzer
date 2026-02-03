import React from "react";
import TopAppBar from "../Components/TopAppBar";
import SidebarNav from "../Components/SidebarNav";
import StatCard from "../Components/StatCard";
import DocumentCard from "../Components/DocumentCard";
import BottomNav from "../Components/BottomNav";

const documents = [
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

export default function UserDashboard() {
  const userName = "අමිල";
  const todayLabel = "ඔක්තෝබර් 24";

  return (
    <div className="min-h-screen w-full bg-[#f6f7f8] dark:bg-[#101822] text-slate-900 dark:text-slate-100">
      <TopAppBar userName={userName} todayLabel={todayLabel} />

      {/* Page Layout (mobile: single col, laptop: sidebar + main) */}
      <div className="w-full pb-24 lg:pb-10 px-0 lg:px-6">
        <div className="lg:flex lg:gap-6">
          <SidebarNav />

          <main className="flex-1">
            {/* Stats Row */}
            <div className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="මුළු ලේඛන" value="12" icon="description" />
                <StatCard
                  label="අවදානම්"
                  value="05"
                  icon="warning"
                  valueClass="text-red-500"
                />
                {/* Optional extra stats for laptop spacing (remove if not needed) */}
                <div className="hidden lg:block">
                  <StatCard label="සූදානම්" value="07" icon="task_alt" />
                </div>
                <div className="hidden lg:block">
                  <StatCard label="සැකසෙමින්" value="01" icon="sync" />
                </div>
              </div>
            </div>

            {/* CTA Section */}
            <div className="px-4 py-2">
              <button className="flex w-full cursor-pointer items-center justify-center rounded-xl h-14 px-5 bg-primary text-white gap-3 text-base font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform">
                <span className="material-symbols-outlined">add_circle</span>
                <span>නව ලේඛනයක් එක් කරන්න</span>
              </button>
            </div>

            {/* Section Header */}
            <div className="flex items-center justify-between px-4 pt-6 pb-2">
              <h3 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
                මෑතකාලීන ලේඛන
              </h3>
              <button className="text-primary text-sm font-semibold">
                සියල්ල බලන්න
              </button>
            </div>

            {/* Document List (laptop: 2 columns) */}
            <div className="px-4 pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {documents.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
