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
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalDocs, setTotalDocs] = useState(0);
  const [riskAssessments, setRiskAssessments] = useState(0);
  const [loadingTotal, setLoadingTotal] = useState(true);
  const [openDoc, setOpenDoc] = useState(null); // For modal
  const apiBaseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  // Reset document list and related states when the component mounts
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
        setRiskAssessments(res.data.riskAssessments || 0);
      } catch {
        setTotalDocs(0);
        setRiskAssessments(0);
      } finally {
        setLoadingTotal(false);
      }
    }
    fetchRecentDocs();
    fetchTotalDocs();
  }, []);



  // Filter recent documents based on the search term entered by the user
  const filteredRecentDocs = recentDocs.filter((doc) => {
    const title = String(doc?.title ?? "");
    return title.toLowerCase().includes(searchTerm.trim().toLowerCase());
  });

  // Helper function to render analysis items or a placeholder if empty
  const renderAnalysisList = (items, emptyText) => {
    if (!Array.isArray(items) || items.length === 0) {
      return <div className="text-sm text-slate-500 dark:text-slate-400">{emptyText}</div>;
    }
    return (
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <li
            key={idx}
            className="rounded-lg border border-blue-800 bg-[#1c2027] px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-background-dark dark:text-slate-200"
          >
            {typeof item === "string" ? item : JSON.stringify(item)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="min-h-screen  text-slate-900 dark:bg-background-dark dark:text-slate-100">
      {/* Top App Bar */}
      <TopAppBar
        avatarUrl="https://lh3.googleusercontent.com/aida-public/AB6AXuBt-RmcjepGTTtxHmbkNM6QwQ4qvX6kU9SXXkSKY_EkVJjBHcfZRQqNP_I3otZrh1W-kq5SsVVZdrLLW4javun_4_Ht7BkJ-Qcif4zlBSrRf1CV9y-btLr201_wBUwY1J8QRLIvE_tyvMHJLxB7KYCmTfeAlBViGpkSHtW9IxDyjG3wZhMy4u3g4BMumOOPGnPOMB0RXM2Lqi4-KP1oSLgjgX_LFiLUoY8hHEq8N_oVhY8qawaQa8YEzsOlLAHfe6uKnqVNfc2596k"
        onNotificationsClick={() => {
          // TODO: Hook into notifications panel when implemented
          console.log("Notifications clicked");
        }}
      />

      {/* Page Layout */}
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 pb-24 pt-6 lg:grid-cols-[260px_1fr] lg:pb-10">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:sticky lg:top-22 lg:block lg:h-[calc(100vh-88px)]">
          <Sidebar />
        </aside>

        {/* Main */}
        <main className="space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <StatCard
              title="Total Documents"
              value={loadingTotal ? "..." : totalDocs}
              icon="description"
              valueClassName="text-slate-900 dark:text-white"
              iconClassName="text-primary"
            />
            <StatCard
              title="Risk Assessments"
              value={loadingTotal ? "..." : riskAssessments}
              icon="warning"
              valueClassName="text-red-500"
              iconClassName="text-red-500"
            />
          </div>

          {/* CTA */}
          <button onClick={() => navigate("/upload")} className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#1c2027] px-5 text-base font-bold text-white shadow-lg shadow-primary/20 transition-transform active:scale-95">
            <span className="material-symbols-outlined">add_circle</span>
            <span >Upload New Document</span>
          </button>

          {/* Section Header */}
          <div className="flex items-center justify-between ">
            <h3 className="text-lg font-bold leading-tight tracking-tight text-slate-900  dark:text-white">
              New document summaries
            </h3>
            <button className="text-sm font-semibold text-primary bg-[#1c2027]">View All</button>
          </div>

          {/* Search */}
          <div>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Find summary by document name..."
              className="h-12 w-full rounded-xl border border-blue-800 bg-[#1c2027] px-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-800 dark:bg-background-dark dark:text-slate-100"
            />
          </div>

          {/* Document List */}
          <div className="space-y-3">
            {loading ? (
              <div className="text-center text-slate-500 dark:text-slate-400">Loading...</div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : filteredRecentDocs.length === 0 ? (
              <div className="text-center text-slate-500 dark:text-slate-400">
                {searchTerm.trim()
                  ? "No documents match your search."
                  : "No documents uploaded in the last 7 days."}
              </div>
            ) : (
              filteredRecentDocs.map((doc) => (
                <DocCard key={doc.id} doc={doc} onViewSummary={() => setOpenDoc(doc)} />
              ))
            )}
          </div>
              {/* Summary Modal */}
              <Modal open={!!openDoc} onClose={() => setOpenDoc(null)}>
                {openDoc && (
                  <div className="flex flex-col md:flex-row w-full h-[80vh]">
                    {/* PDF Viewer */}
                    <div className="flex-1 min-w-75 bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-auto">
                      {String(openDoc.mimeType || "").includes("pdf") || String(openDoc.title || "").toLowerCase().endsWith(".pdf") ? (
                        <iframe
                          key={openDoc.id}
                          title={openDoc.title || "Document"}
                          className="h-full w-full"
                          src={`${apiBaseUrl}/api/documents/${openDoc.id}/file`}
                        />
                      ) : (
                        <div className="text-center text-slate-500 px-6">
                          Preview not available for this file type.
                          <div className="mt-2 text-xs">({openDoc.title})</div>
                          <a
                            className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/20"
                            href={`${apiBaseUrl}/api/documents/${openDoc.id}/file`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Download
                          </a>
                        </div>
                      )}
                    </div>
                    {/* Summary & Details */}
                    <div className="flex-1 min-w-75 p-6 overflow-auto">
                      <h2 className="text-xl font-bold mb-2 text-slate-900 dark:text-white">Summary</h2>
                      <div className="mb-4 text-slate-700 dark:text-slate-200 whitespace-pre-line">{openDoc.summary || "No summary available."}</div>

                      <h3 className="text-lg font-semibold mt-4 mb-2 text-slate-900 dark:text-white">Legal Analysis</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="mb-1 text-sm font-bold text-slate-900 dark:text-white">Rights</div>
                          {renderAnalysisList(openDoc?.analysis?.rights, "No rights identified.")}
                        </div>
                        <div>
                          <div className="mb-1 text-sm font-bold text-slate-900 dark:text-white">Obligations</div>
                          {renderAnalysisList(openDoc?.analysis?.obligations, "No obligations identified.")}
                        </div>
                        <div>
                          <div className="mb-1 text-sm font-bold text-slate-900 dark:text-white">Deadlines</div>
                          {renderAnalysisList(openDoc?.analysis?.deadlines, "No deadlines identified.")}
                        </div>
                        <div>
                          <div className="mb-1 text-sm font-bold text-slate-900 dark:text-white">Risks</div>
                          {renderAnalysisList(openDoc?.analysis?.risks, "No risks identified.")}
                        </div>
                      </div>

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

