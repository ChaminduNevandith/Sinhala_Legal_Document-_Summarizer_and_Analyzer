import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import client from "../api/client";
import TopAppBar from "../Components/TopAppBar";

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
      } finally {
        setLoading(false);
      }
    }
    if (docId) fetchDocument();
  }, [docId]);

  return (
    <div className="min-h-screen bg-[#1c2027] text-slate-900  dark:text-white font-display">
      {/* Top App Bar */}
      <TopAppBar
        title="ආයුබෝවන්, අමිල"
        subtitle="අද දිනය: ඔක්තෝබර් 24"
        onNotificationsClick={() => {}}
        onLogoutClick={() => {}}
        className="mx-auto w-full "
      />

      {/* Page layout */}
      <div className="mx-auto w-full max-w-6xl px-4 pb-32">
        <div className="grid grid-cols-1 gap-6 pt-6 lg:grid-cols-[1fr_320px]">
          {/* Main */}
          <main className="min-w-0">
            {/* Header Section */}
            <div className="pb-2">
              <h3 className="text-left text-2xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white">
                නිවාස කුලී ගිවිසුම - මහරගම
              </h3>
              <p className="mt-1 text-sm font-normal leading-normal text-slate-500 dark:text-[#9da8b9]">
                සාරාංශය සකස් කළේ: 2023 නොවැම්බර් 12
              </p>
            </div>

            {/* Tabs */}
            <div className="sticky top-[73px] z-40 -mx-4 border-b border-slate-200 bg-[#1c2027] backdrop-blur-md dark:border-[#3b4554] dark:bg-[#2e343f] lg:static lg:top-auto lg:mx-0 lg:rounded-2xl lg:border lg:bg-[#2e343f] lg:px-3 lg:py-2 lg:shadow-sm lg:backdrop-blur-0 dark:lg:bg-card-dark dark:lg:border-slate-800">
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
                        <div className="mt-0.5 flex-shrink-0">
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
                  <div className="rounded-lg border-l-4 border-success bg-success/10 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-success">
                        verified_user
                      </span>
                      <span className="text-base font-bold text-success">
                        ඔබගේ අයිතිවාසිකම් (Rights)
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
                  <div className="rounded-lg border-l-4 border-warning bg-warning/10 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-warning">
                        assignment_late
                      </span>
                      <span className="text-base font-bold text-warning">
                        ඔබට කළ යුතු දේ (Obligations)
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
                  <div className="rounded-lg border-l-4 border-danger bg-danger/10 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-danger">
                        event_busy
                      </span>
                      <span className="text-base font-bold text-danger">
                        වැදගත් දිනයන් (Deadlines)
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
                  <h4 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
                    Risk and actionable insights explained in simple language
                  </h4>

                  <div className="space-y-5">
                    {loading ? (
                      <p className="text-center text-slate-600 dark:text-slate-400">Loading risk analysis...</p>
                    ) : analysis.risks.length > 0 ? (
                      analysis.risks.map((risk, idx) => (
                        <QA key={idx} q={`වැදගතක්: ${risk.substring(0, 60)}...`} a={risk} />
                      ))
                    ) : (
                      <p className="text-center text-slate-600 dark:text-slate-400">No risks identified in the document.</p>
                    )}
                  </div>
                </section>
              )}
            </div>
          </main>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-[92px] space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-[#1c2027] p-4 shadow-sm  dark:border-slate-800 dark:bg-[#2e343f]">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Quick actions</p>

                <div className="mt-3 grid grid-cols-2 gap-2 ">
                  <SideAction icon="picture_as_pdf" label="PDF Download" />
                  <SideAction icon="share" label="Share" />
                  <SideAction icon="bookmark" label="Save" />
                  <SideAction icon="report" label="Report" />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-[#1c2027] p-4 shadow-sm dark:border-slate-800 dark:bg-[#2e343f]">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Document info</p>
                <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  <Row k="Type" v="Rental Agreement" />
                  <Row k="Status" v="Ready" />
                  <Row k="Created" v="2023-11-12" />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Floating Action Button (mobile + desktop) */}
      <div className="fixed bottom-8 right-6 z-[60]">
        <button
          type="button"
          className="group flex items-center justify-center gap-3 rounded-full bg-primary px-6 py-4 font-bold text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary/90 active:scale-95"
        >
          <span className="material-symbols-outlined group-hover:animate-bounce">
            picture_as_pdf
          </span>
          <span className="text-sm">සාරාංශය බාගත කරන්න (PDF)</span>
        </button>
      </div>

      {/* iOS Bottom Indicator (mobile only) */}
      <div className="fixed bottom-2 left-1/2 z-[70] h-1.5 w-32 -translate-x-1/2 rounded-full bg-slate-300 dark:bg-slate-700 lg:hidden" />
    </div>
  );
}

function QA({ q, a }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-card-dark">
      <p className="mb-2 text-sm font-bold text-primary">{q}</p>
      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{a}</p>
    </div>
  );
}

function SideAction({ icon, label }) {
  return (
    <button
      type="button"
      className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-[#1c2027] px-3 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-background-dark dark:text-slate-200 dark:hover:bg-slate-800"
    >
      <span className="material-symbols-outlined text-lg">{icon}</span>
      {label}
    </button>
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
