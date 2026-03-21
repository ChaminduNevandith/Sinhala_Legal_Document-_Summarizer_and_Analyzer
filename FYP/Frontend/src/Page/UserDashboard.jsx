import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import Sidebar from "../Components/Sidebar.jsx";
import StatCard from "../Components/StatCard.jsx";
import DocCard from "../Components/DocCard.jsx";
import Modal from "../Components/Modal.jsx";

import BottomNavItem from "../Components/BottomNavItem.jsx";
import TopAppBar from "../Components/TopAppBar.jsx";


export default function Dashboard() {
  const navigate = useNavigate();
  const [recentDocs, setRecentDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalDocs, setTotalDocs] = useState(0);
  const [loadingTotal, setLoadingTotal] = useState(true);
  const [user, setUser] = useState(null);
  const [today, setToday] = useState("");
  const [openDoc, setOpenDoc] = useState(null); // For modal

  const handleLogout = async () => {
    try {
      await client.post("/api/auth/logout");
      navigate("/login", { replace: true });
    } catch (err) {
      console.error("Logout failed:", err?.message || err);
    }
  };

  useEffect(() => {
    async function fetchRecentDocs() {
      setLoading(true);
      setError(null);
      try {
        const res = await client.get("/api/getdocuments/recent");
        setRecentDocs(res.data.documents || []);
      } catch (err) {
        setError(err.message || "Failed to load documents");
      } finally {
        setLoading(false);
      }
    }
    async function fetchTotalDocs() {
      setLoadingTotal(true);
      try {
        const res = await client.get("/api/getdocuments/total");
        setTotalDocs(res.data.total || 0);
      } catch {
        setTotalDocs(0);
      } finally {
        setLoadingTotal(false);
      }
    }
    async function fetchUser() {
      try {
        const res = await client.get("/api/auth/me");
        setUser(res.data.user);
      } catch {
        setUser(null);
      }
    }
    function getToday() {
      const d = new Date();
      // Format: YYYY-MM-DD or localize as needed
      return d.toLocaleDateString('en-CA');
    }
    fetchRecentDocs();
    fetchTotalDocs();
    fetchUser();
    setToday(getToday());
  }, []);

  return (
    <div className="min-h-screen  text-slate-900 dark:bg-background-dark dark:text-slate-100">
      {/* Top App Bar */}
      <TopAppBar
        title={user ? `Welcome, ${user.name}` : "Welcome"}
        subtitle={today ? `Today's date: ${today}` : ""}
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
        <aside className="hidden lg:sticky lg:top-22 lg:block lg:h-[calc(100vh-88px)]">
          <Sidebar />
        </aside>

        {/* Main */}
        <main className="space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard
              title="මුළු ලේඛන"
              value={loadingTotal ? "..." : totalDocs}
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
          <button onClick={() => navigate("/upload")} className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#1c2027] px-5 text-base font-bold text-white shadow-lg shadow-primary/20 transition-transform active:scale-95">
            <span className="material-symbols-outlined">add_circle</span>
            <span >නව ලේඛනයක් එක් කරන්න</span>
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
            {loading ? (
              <div className="text-center text-slate-500 dark:text-slate-400">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : recentDocs.length === 0 ? (
              <div className="text-center text-slate-500 dark:text-slate-400">No documents uploaded in the last 7 days.</div>
            ) : (
              recentDocs.map((doc) => (
                <DocCard key={doc.id} doc={doc} onViewSummary={() => setOpenDoc(doc)} />
              ))
            )}
          </div>
              {/* Summary Modal */}
              <Modal open={!!openDoc} onClose={() => setOpenDoc(null)}>
                {openDoc && (
                  <div className="flex flex-col md:flex-row w-full h-[80vh]">
                    {/* PDF Viewer */}
                    <div className="flex-1 min-w-[300px] bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-auto">
                      <div className="text-center text-slate-500">PDF preview not available<br/>({openDoc.title})</div>
                    </div>
                    {/* Summary & Details */}
                    <div className="flex-1 min-w-[300px] p-6 overflow-auto">
                      <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Summary</h2>
                      <div className="mb-4 text-slate-700 dark:text-slate-200 whitespace-pre-line">{openDoc.summary || "No summary available."}</div>
                      <h3 className="text-lg font-semibold mt-4 mb-1 text-slate-900 dark:text-white">Details</h3>
                      <div className="text-sm text-slate-600 dark:text-slate-300">
                        <div><b>File Name:</b> {openDoc.title}</div>
                        <div><b>Uploaded:</b> {openDoc.meta}</div>
                        {/* Add more details as needed */}
                      </div>
                    </div>
                  </div>
                )}
              </Modal>
        </main>

        {/* Right Panel (Desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-22 space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-[#1c2027] p-4 shadow-sm dark:border-slate-800 dark:bg-surface-dark">
              <p className="text-sm font-semibold  text-slate-900 dark:text-white">
                Quick Actions
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 ">
                <SmallAction icon="upload" label="Upload" onClick={() => navigate("/upload")} />
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

