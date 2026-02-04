import React from "react";

export default function UploadNewDocument() {
  return (
    <div className="min-h-screen bg-background-light text-slate-900 dark:bg-background-dark dark:text-white">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-background-light/80 backdrop-blur-md dark:border-slate-800 dark:bg-background-dark/80">
        <div className="mx-auto w-full max-w-6xl">
          {/* iOS status bar (mobile only) */}
          <div className="flex h-11 items-center justify-between px-6 lg:hidden">
            <span className="text-xs font-semibold">9:41</span>
            <div className="flex gap-1.5">
              <span className="material-symbols-outlined text-[14px]">
                signal_cellular_4_bar
              </span>
              <span className="material-symbols-outlined text-[14px]">wifi</span>
              <span className="material-symbols-outlined text-[14px]">
                battery_full
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-4">
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-full text-primary transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Go back"
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
              <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-slate-300 bg-white/50 px-6 py-12 transition-all hover:border-primary/50 dark:border-[#3b4554] dark:bg-[#1c2027]/30">
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

                <button
                  type="button"
                  className="flex h-11 min-w-[160px] items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-white shadow-lg shadow-primary/20"
                >
                  Browse file
                </button>

                {/* Optional: file helper */}
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Max size: 10MB (example)
                </p>
              </div>
            </div>

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
                    <select className="appearance-none flex h-14 w-full rounded-xl border border-slate-200 bg-white px-4 text-base font-normal outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-[#3b4554] dark:bg-[#1c2027]">
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
              className="flex h-14 w-full items-center justify-center rounded-xl bg-[#1c2027] text-base font-bold text-white shadow-xl shadow-primary/30 transition-transform active:scale-95 lg:w-auto lg:px-10"
            >
              Upload &amp; Analyze
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
