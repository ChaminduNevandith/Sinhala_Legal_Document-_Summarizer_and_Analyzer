import React, { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import * as mammoth from "mammoth/mammoth.browser";
import TopAppBar from "../Components/TopAppBar.jsx";

export default function UploadNewDocument() {
  const navigate = useNavigate();

  const fileInputRef = useRef(null);
  const uploadInFlightRef = useRef(false);
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState(""); // for PDFs
  const [docxHtml, setDocxHtml] = useState(""); // for DOCX
  const [docType, setDocType] = useState("contract");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStage, setUploadStage] = useState("idle"); // idle | uploading | processing
  const [isConverting, setIsConverting] = useState(false);

  // Cleanup preview URLs on unmount or when file changes
  const resetPreview = useCallback(() => {
    setPreviewUrl("");
    setDocxHtml("");
  }, []);

  // Reset upload state to initial values
  const resetUploadState = useCallback(() => {
    setUploading(false);
    setUploadProgress(0);
    setUploadStage("idle");
    uploadInFlightRef.current = false;
  }, []);

  // Check if the file type is supported (PDF, DOCX, or images)
  const isSupportedType = (f) => {
    const allowedMime = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const allowedExt = [".pdf", ".docx", ".png", ".jpg", ".jpeg", ".webp"];
    const lowerName = (f.name || "").toLowerCase();
    const nameOk = allowedExt.some((ext) => lowerName.endsWith(ext));
    const isImageMime = typeof f.type === "string" && f.type.startsWith("image/");
    return allowedMime.includes(f.type) || isImageMime || nameOk;
  };


  // Handle file selection from input or drag-and-drop
  const handleSelectedFile = async (f) => {
    if (!f) return;
    setError("");
    resetPreview();
    setUploadProgress(0);
    setUploadStage("idle");

    if (!isSupportedType(f)) {
      setError("Only PDF, DOCX, or image files are allowed.");
      setFile(null);
      return;
    }

    setFile(f);

    if (f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else if (
      f.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      f.name.toLowerCase().endsWith(".docx")
    ) {
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
    } else {
      // Images: preview using object URL
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    }
  };

  //  Handlers for file input, drag-and-drop, and clearing the selected file
  const onInputChange = async (e) => {
    const f = e.target.files?.[0];
    await handleSelectedFile(f);
  };

  // Trigger file input click when the user clicks the "Browse file" button
  const onBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Handle file drop in the upload area
  const onDrop = async (e) => {
    e.preventDefault();
    const f = e.dataTransfer?.files?.[0];
    await handleSelectedFile(f);
  };

  // Prevent default behavior for drag over to allow dropping
  const onDragOver = (e) => {
    e.preventDefault();
  };

  // Clear the selected file and reset all related states
  const clearFile = () => {
    setFile(null);
    setError("");
    resetPreview();
    resetUploadState();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen bg-background-light text-slate-900 dark:bg-background-dark dark:text-white">
      {/* Top App Bar */}
      <TopAppBar onNotificationsClick={() => {}} className="mx-auto w-full " />

      {/* Page */}
      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Left: Upload area */}
          <section className="space-y-4">
            {!file && (
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

                  <div className="flex max-w-130 flex-col items-center gap-2">
                    <p className="text-center text-lg font-bold leading-tight">
                      Drag &amp; drop or click to upload
                    </p>
                    <p className="text-center text-sm font-normal text-slate-500 dark:text-slate-400">
                        Supported formats: PDF, DOCX, Images
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.png,.jpg,.jpeg,.webp,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                    className="hidden"
                    onChange={onInputChange}
                  />

                  <button
                    type="button"
                    onClick={onBrowseClick}
                    className="flex h-11 min-w-40 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-primary/20"
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
            )}

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
                  {previewUrl && (file?.type === "application/pdf" || file?.name?.toLowerCase().endsWith(".pdf")) && (
                    <iframe
                      title="PDF Preview"
                      src={previewUrl}
                      className="h-[70vh] w-full rounded-lg border border-slate-200 dark:border-slate-700"
                    />
                  )}

                  {previewUrl && !(file?.type === "application/pdf" || file?.name?.toLowerCase().endsWith(".pdf")) && (
                    <div className="flex max-h-[70vh] items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-900/30">
                      <img src={previewUrl} alt="Preview" className="max-h-[68vh] w-auto rounded" />
                    </div>
                  )}

                  {!previewUrl && (
                    <div className="max-h-[70vh] overflow-auto rounded-lg border border-slate-200 p-4 dark:border-slate-700">
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
                    <select required value={docType} onChange={(e) => setDocType(e.target.value)} className="appearance-none flex h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-normal outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-[#3b4554] dark:bg-[#1c2027]">
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

                {/* Buttons */}
                <div className="pt-2">
                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      disabled={!file || uploading}
                      onClick={async () => {
                        if (!file) return;
                        // Hard guard against rapid double-clicks before React state updates
                        if (uploadInFlightRef.current) return;
                        uploadInFlightRef.current = true;

                        setUploading(true);
                        setUploadProgress(0);
                        setUploadStage("uploading");
                        setError("");
                        try {
                          const form = new FormData();
                          form.append("file", file);
                          form.append("doc_type", docType);
                          const res = await client.post("/api/documents/upload", form, {
                            headers: { "Content-Type": "multipart/form-data" },
                            onUploadProgress: (evt) => {
                              const total = evt?.total;
                              const loaded = evt?.loaded ?? 0;
                              if (!total) return;
                              const pct = Math.max(0, Math.min(100, Math.round((loaded / total) * 100)));
                              setUploadProgress(pct);
                              if (pct >= 100) setUploadStage("processing");
                            },
                          });

                          // Server-side work may still be happening; keep UI in a "processing" state
                          setUploadStage("processing");
                          const newId = res?.data?.document?.id;
                          if (newId) {
                            navigate(`/document?id=${newId}`);
                          } else {
                            navigate("/document");
                          }
                        } catch (e) {
                          setError(e?.message || "Upload failed.");
                          resetUploadState();
                          return;
                        }
                      }}
                      className="flex h-14 w-full items-center justify-center rounded-xl bg-[#1c2027] text-base font-bold text-white shadow-xl shadow-primary/30 transition-transform active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {uploading
                        ? uploadStage === "processing"
                          ? "Processing…"
                          : uploadProgress > 0
                            ? `Uploading… ${uploadProgress}%`
                            : "Uploading…"
                        : "Upload & Analyze"}
                    </button>

                    {(uploading || uploadProgress > 0) && (
                      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-[#1c2027]/60">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                            {uploadStage === "processing" ? "Document is processing…" : "Uploading document…"}
                          </p>
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            {uploadStage === "processing" ? "" : `${uploadProgress}%`}
                          </p>
                        </div>
                        {uploadStage !== "processing" && (
                          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                            <div
                              className="h-full rounded-full bg-primary transition-[width]"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => navigate(-1)}
                      className="flex h-12 w-full items-center justify-center rounded-xl bg-[#1c2027] text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
