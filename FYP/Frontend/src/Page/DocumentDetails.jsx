import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import client from "../api/client";
import TopAppBar from "../Components/TopAppBar";
import Sidebar from "../Components/Sidebar.jsx";

export default function DocumentDetails() {
  const navigate = useNavigate();
  const tabs = useMemo(
    () => [
      { id: "quick", label: "Quick Summary" },
      { id: "highlights", label: "highlights" },
      { id: "explanation", label: "Risk explanation" },
    ],
    []
  );

  const [activeTab, setActiveTab] = useState("quick");
  const [summary, setSummary] = useState([]);
  const [document, setDocument] = useState(null);
  const [analysis, setAnalysis] = useState({
    rights: [],
    obligations: [],
    deadlines: [],
    risks: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const docId = searchParams.get("id");

  useEffect(() => {
    async function fetchDocument() {
      setLoading(true);
      setError(null);
      try {
        const res = await client.get(`/api/documents/${docId}`);
        const doc = res.data?.document;
        setDocument(doc ?? null);
        
        // Process summary
        if (doc?.summary) {
          let items = doc.summary.split("\n").filter(Boolean);
          if (items.length === 1) items = doc.summary.split("•").filter(Boolean);
          setSummary(items);
        } else {
          setSummary(["No summary available."]);
        }

        // Process legal analysis
        if (doc?.analysis) {
          setAnalysis({
            rights: Array.isArray(doc.analysis.rights) ? doc.analysis.rights : [],
            obligations: Array.isArray(doc.analysis.obligations) ? doc.analysis.obligations : [],
            deadlines: Array.isArray(doc.analysis.deadlines) ? doc.analysis.deadlines : [],
            risks: Array.isArray(doc.analysis.risks) ? doc.analysis.risks : []
          });
        }
      } catch (e) {
        setError(e.message || "Failed to load document");
        setSummary(["No summary available."]);
        setDocument(null);
      } finally {
        setLoading(false);
      }
    }
    if (docId) fetchDocument();
  }, [docId]);

  const uploadedAtText = useMemo(() => {
    const raw =
      document?.createdAt ??
      document?.uploadedAt ??
      document?.date ??
      document?.meta;

    if (!raw) return "";
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return String(raw);
  }, [document]);

  return (
    <div className="min-h-screen text-slate-900 dark:bg-background-dark dark:text-slate-100 font-display">

      <TopAppBar
        onNotificationsClick={() => {
          console.log("Notifications clicked");
        }}
      />


      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 pb-24 pt-6 lg:grid-cols-[260px_1fr] lg:pb-10">
        <aside className="hidden lg:sticky lg:top-22 lg:block lg:h-[calc(100vh-88px)]">
          <Sidebar />
        </aside>


        <main className="min-w-0">

          <div className="pb-2">
            <h3 className="text-left text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
              {document?.title || document?.name || "Document"}
            </h3>
            {uploadedAtText ? (
              <p className="mt-1 text-sm font-normal leading-normal text-slate-500 dark:text-[#9da8b9]">
                Uploaded: {uploadedAtText}
              </p>
            ) : null}
          </div>

            <div className="sticky top-18.25 z-40 -mx-4 border-b border-slate-200 bg-[#1c2027] backdrop-blur-md dark:border-[#3b4554] dark:bg-[#2e343f] lg:static lg:top-auto lg:mx-0 lg:rounded-2xl lg:border lg:bg-[#2e343f] lg:px-3 lg:py-2 lg:shadow-sm lg:backdrop-blur-0 dark:lg:bg-card-dark dark:lg:border-slate-800">
              <div className="flex overflow-x-auto px-4 lg:overflow-visible lg:px-0">
                {tabs.map((t) => {
                  const active = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setActiveTab(t.id)}
                      className={[
                        "flex min-w-max flex-1 items-center justify-center whitespace-nowrap px-4 pb-3 pt-4 lg:flex-none lg:rounded-xl lg:px-4 lg:py-2",
                        active
                          ? "border-b-[3px] border-primary text-primary lg:border-b-0 lg:bg-primary/10"
                          : "border-b-[3px] border-transparent text-slate-500 hover:text-slate-700 dark:text-[#9da8b9] dark:hover:text-white lg:hover:bg-slate-50 dark:lg:hover:bg-slate-800/60",
                      ].join(" ")}
                    >
                      <p className="text-sm font-bold leading-normal">{t.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

          {/* Content */}
          <div className="pt-6">
              {activeTab === "quick" && (
                <section className="space-y-1">
                  {loading ? (
                    <div className="py-6 text-center text-slate-500">Loading summary...</div>
                  ) : error ? (
                    <div className="py-6 text-center text-red-500">{error}</div>
                  ) : (
                    summary.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex gap-x-4 border-b border-slate-100 py-3.5 dark:border-slate-800/50"
                      >
                        <div className="mt-0.5 shrink-0">
                          <span className="material-symbols-outlined text-[20px] text-primary">
                            check_circle
                          </span>
                        </div>
                        <p className="text-base font-normal leading-relaxed text-slate-800 dark:text-white">
                          {item}
                        </p>
                      </div>
                    ))
                  )}
                </section>
              )}

              {activeTab === "highlights" && (
                <section className="space-y-4">
                  <h4 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">
                    Important highlights from the document
                  </h4>

                  {/* Rights */}
                  <div className="rounded-lg border-l-4 border-success bg-[#1c2027] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-success">
                        verified_user
                      </span>
                      <span className="text-base font-bold text-success">
                        Your Rights 
                      </span>
                    </div>
                    {loading ? (
                      <p className="text-sm text-slate-600 dark:text-slate-400">Loading rights...</p>
                    ) : analysis.rights.length > 0 ? (
                      <ul className="ml-5 list-disc space-y-2 text-sm text-slate-800 dark:text-white/90">
                        {analysis.rights.map((right, idx) => (
                          <li key={idx}>{right}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-600 dark:text-slate-400">No rights identified.</p>
                    )}
                  </div>

                  {/* Obligations */}
                  <div className="rounded-lg border-l-4 border-warning bg-[#1c2027] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-warning">
                        assignment_late
                      </span>
                      <span className="text-base font-bold text-warning">
                        Your Obligations 
                      </span>
                    </div>
                    {loading ? (
                      <p className="text-sm text-slate-600 dark:text-slate-400">Loading obligations...</p>
                    ) : analysis.obligations.length > 0 ? (
                      <ul className="ml-5 list-disc space-y-2 text-sm text-slate-800 dark:text-white/90">
                        {analysis.obligations.map((obligation, idx) => (
                          <li key={idx}>{obligation}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-600 dark:text-slate-400">No obligations identified.</p>
                    )}
                  </div>

                  {/* Deadlines */}
                  <div className="rounded-lg border-l-4 border-danger bg-[#1c2027] p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-danger">
                        event_busy
                      </span>
                      <span className="text-base font-bold text-danger">
                        Your Deadlines 
                      </span>
                    </div>
                    {loading ? (
                      <p className="text-sm text-slate-600 dark:text-slate-400">Loading deadlines...</p>
                    ) : analysis.deadlines.length > 0 ? (
                      <ul className="ml-5 list-disc space-y-2 text-sm text-slate-800 dark:text-white/90">
                        {analysis.deadlines.map((deadline, idx) => (
                          <li key={idx}>{deadline}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-slate-600 dark:text-slate-400">No deadlines identified.</p>
                    )}
                  </div>
                </section>
              )}

              {activeTab === "explanation" && (
                <section className="space-y-6">
                  <h4 className="mb-2 text-lg font-bold text-slate-900 dark:text-white ">
                    Risks
                  </h4>

                  <div className="space-y-5">
                    {loading ? (
                      <p className="text-center text-slate-600 dark:text-slate-400">Loading risk analysis...</p>
                    ) : analysis.risks.length > 0 ? (
                      analysis.risks.map((risk, idx) => (
                        <QA key={idx} q={`Important: ${risk.substring(0, 60)}...`} a={risk} />
                      ))
                    ) : (
                      <p className="text-center text-slate-600 dark:text-slate-400">No risks identified in the document.</p>
                    )}
                  </div>
                </section>
              )}
          </div>

          {/* Document info (updated, no Quick actions) */}
          <section className="mt-6 rounded-2xl border border-slate-200 bg-[#1c2027] p-4 shadow-sm dark:border-slate-800 dark:bg-[#2e343f]">
            <p className="text-sm font-bold text-slate-900 dark:text-white">Document info</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <Row k="Title" v={document?.title || document?.name || "-"} />
              <Row k="Uploaded" v={uploadedAtText || "-"} />
              <Row k="Document ID" v={docId || "-"} />
              <Row k="Status" v={loading ? "Loading..." : error ? "Error" : "Ready"} />
            </div>
          </section>
        </main>
      </div>

      {/* Floating Action Button (mobile + desktop) */}
      <div className="fixed bottom-8 right-6 z-60">
        <button
          type="button"
          onClick={() => navigate("/upload")}
          className="group flex items-center justify-center gap-3 rounded-full bg-primary px-6 py-4 font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 active:scale-95"
        >
          <span className="material-symbols-outlined group-hover:animate-bounce">
            picture_as_pdf
          </span>
          <span className="text-sm">Upload New Document</span>
        </button>
      </div>

      {/* iOS Bottom Indicator (mobile only) */}
      <div className="fixed bottom-2 left-1/2 z-70 h-1.5 w-32 -translate-x-1/2 rounded-full bg-slate-300 dark:bg-slate-700 lg:hidden" />
    </div>
  );
}

function QA({ q, a }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-[#1c2027] p-4 dark:border-slate-800 dark:bg-card-dark">
      <p className="mb-2 text-sm font-bold text-primary">{q}</p>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{a}</p>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500 dark:text-slate-400">{k}</span>
      <span className="font-semibold text-slate-900 dark:text-white">{v}</span>
    </div>
  );
}
