import React, { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import * as mammoth from "mammoth/mammoth.browser";

export default function UploadNewDocument() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(""); // for PDFs
  const [docxHtml, setDocxHtml] = useState(""); // for DOCX
  const [docType, setDocType] = useState("contract");
  const [queryText, setQueryText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const resetPreview = useCallback(() => {
    setPreviewUrl("");
    setDocxHtml("");
  }, []);

  const isSupportedType = (f) => {
    const allowedMime = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExt = [".pdf", ".docx"];
    const nameOk = allowedExt.some((ext) => f.name?.toLowerCase().endsWith(ext));
    return allowedMime.includes(f.type) || nameOk;
  };

  const handleSelectedFile = async (f) => {
    if (!f) return;
    setError("");
    resetPreview();

    if (!isSupportedType(f)) {
      setError("Only PDF and DOCX files are allowed.");
      setFile(null);
      return;
    }

    setFile(f);

    if (f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      // DOCX: convert to HTML using mammoth
      try {
        setIsConverting(true);
        const arrayBuffer = await f.arrayBuffer();
        const { value } = await mammoth.convertToHtml({ arrayBuffer });
        setDocxHtml(value || "<p>No content extracted.</p>");
      } catch (e) {
        setError("Could not render DOCX preview.");
      } finally {
        setIsConverting(false);
      }
    }
  };

  const onInputChange = async (e) => {
    const f = e.target.files?.[0];
    await handleSelectedFile(f);
  };

  const onBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const onDrop = async (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    await handleSelectedFile(f);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const clearFile = () => {
    setFile(null);
    setError("");
    resetPreview();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-background-light text-slate-900 dark:bg-background-dark dark:text-white">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-background-light/80 backdrop-blur-md dark:border-slate-800 dark:bg-background-dark/80">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex items-center justify-between px-4 py-4">
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Go back"
              onClick={() => navigate("/")}
            >
              <span className="material-symbols-outlined">arrow_back_ios</span>
            </button>

            <div className="flex flex-1 flex-col items-center">
              <h2 className="text-lg font-bold leading-tight tracking-tight">
                Upload New Document
              </h2>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                අලුත් ලේඛනයක් එක් කරන්න
              </p>
            </div>

            <div className="size-10" />
          </div>
        </div>
      </header>

      {/* Page */}
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left: Upload area */}
          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#1c2027]/60">
              <div
                className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-slate-300 bg-white/50 px-6 py-12 transition-all hover:border-primary/50 dark:border-[#3b4554] dark:bg-[#1c2027]/30"
                onDrop={onDrop}
                onDragOver={onDragOver}
              >
                <div className="rounded-full bg-primary/10 p-4">
                  <span className="material-symbols-outlined text-4xl text-primary">
                    cloud_upload
                  </span>
                </div>

                <div className="flex max-w-[520px] flex-col items-center gap-2">
                  <p className="text-center text-lg font-bold leading-tight">
                    Drag &amp; drop or click to upload
                  </p>
                  <p className="text-center text-sm font-normal text-slate-500 dark:text-slate-400">
                    Supported formats: PDF, DOCX
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={onInputChange}
                />

                <button
                  type="button"
                  onClick={onBrowseClick}
                  className="flex h-11 min-w-[160px] items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-primary/20"
                >
                  Browse file
                </button>

                {/* Optional: file helper */}
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Max size: 10MB (example)
                </p>

                {error && (
                  <p className="mt-2 text-sm font-semibold text-red-600 dark:text-red-400">
                    {error}
                  </p>
                )}
              </div>
            </div>

            {/* Preview Panel */}
            {file && (
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#1c2027]/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">description</span>
                    <div>
                      <p className="text-sm font-semibold">{file.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={clearFile}
                    className="rounded-lg px-3 py-1 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-4">
                  {previewUrl && (
                    <iframe
                      title="PDF Preview"
                      src={previewUrl}
                      className="h-[480px] w-full rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                  )}
                  {!previewUrl && (
                    <div className="max-h-[480px] overflow-auto rounded-lg border border-slate-200 p-4 dark:border-slate-700">
                      {isConverting ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400">Converting DOCX to preview…</p>
                      ) : (
                        <div className="prose dark:prose-invert" dangerouslySetInnerHTML={{ __html: docxHtml }} />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Privacy Note */}
            <div className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 dark:bg-slate-800/50">
              <span className="material-symbols-outlined text-[18px] text-slate-500">
                lock
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your document is confidential &amp; encrypted
              </p>
            </div>
          </section>

          {/* Right: Form */}
          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-[#1c2027]/60">
              <div className="space-y-4">
                {/* Document Type */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-end justify-between">
                    <label className="text-base font-medium leading-normal text-slate-700 dark:text-white">
                      Document Type
                    </label>
                    <span className="text-[10px] font-semibold uppercase text-slate-500">
                      ලේඛන වර්ගය
                    </span>
                  </div>

                  <div className="relative">
                    <select value={docType} onChange={(e) => setDocType(e.target.value)} className="appearance-none flex h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-normal outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-[#3b4554] dark:bg-[#1c2027]">
                      <option value="contract">Contract or Agreement</option>
                      <option value="deed">Property Deed / Land Title</option>
                      <option value="notice">Legal Notice</option>
                      <option value="employment">Employment Letter</option>
                      <option value="other">Other Legal Document</option>
                    </select>

                    {/* right icon */}
                    <span className="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Query */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-end justify-between">
                    <label className="text-base font-medium leading-normal text-slate-700 dark:text-white">
                      What do you want to understand?
                    </label>
                    <span className="text-[10px] font-semibold uppercase text-slate-500">
                      පැහැදිලි කරගත යුතු කරුණු
                    </span>
                  </div>

                  <textarea
                    className="min-h-32 w-full rounded-xl border border-slate-200 bg-white p-4 text-base font-normal outline-none transition-all placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-[#3b4554] dark:bg-[#1c2027] dark:placeholder:text-slate-500"
                    placeholder="e.g. Is there any hidden cost or termination fee?"
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Desktop helper panel */}
            <div className="hidden rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-[#1c2027]/60 dark:text-slate-300 lg:block">
              <p className="font-semibold text-slate-900 dark:text-white">Tips</p>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>Ask about termination clauses, fees, and liabilities.</li>
                <li>Mention any dates or amounts you care about.</li>
                <li>Upload the full document for best results.</li>
              </ul>
            </div>
          </section>
        </div>

        {/* Footer buttons */}
        <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-800">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-end">
            <button
              type="button"
              disabled={!file || uploading}
              onClick={async () => {
                if (!file) return;
                setUploading(true);
                setError("");
                try {
                  const form = new FormData();
                  form.append("file", file);
                  form.append("doc_type", docType);
                  form.append("query_text", queryText);
                  await client.post("/api/documents/upload", form, {
                    headers: { "Content-Type": "multipart/form-data" },
                  });
                  navigate("/");
                } catch (e) {
                  setError(e?.message || "Upload failed.");
                } finally {
                  setUploading(false);
                }
              }}
              className="flex h-14 w-full items-center justify-center rounded-xl bg-[#1c2027] text-base font-bold text-white shadow-xl shadow-primary/30 transition-transform active:scale-95 lg:w-auto lg:px-10 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {uploading ? "Uploading…" : "Upload & Analyze"}
            </button>

            <button
              type="button"
              className="flex h-12 w-full items-center justify-center rounded-xl bg-[#1c2027] text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:w-auto lg:px-8"
            >
              Cancel
            </button>
          </div>

          {/* iOS home indicator (mobile only) */}
          <div className="mx-auto mt-6 mb-2 h-1.5 w-32 rounded-full bg-slate-300 dark:bg-slate-700 lg:hidden" />
        </div>
      </div>
    </div>
  );
}
