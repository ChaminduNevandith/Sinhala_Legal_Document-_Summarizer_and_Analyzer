import React from "react";

export default function FeatureCard({ icon, title, description, previewIcon }) {
  return (
    <div className="rounded-xl bg-white dark:bg-[#1c2027] p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex gap-4 lg:flex-col lg:gap-3 transition-all duration-200 hover:shadow-xl hover:-translate-y-1 hover:border-blue-400 dark:hover:border-blue-500">
      {/* Left/Text */}
      <div className="flex flex-col gap-1 flex-[2_2_0px] lg:flex-none">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary">{icon}</span>
          <p className="text-slate-900 dark:text-white text-base font-bold leading-tight">
            {title}
          </p>
        </div>
        <p className="text-slate-500 dark:text-[#9da8b9] text-sm font-normal leading-normal">
          {description}
        </p>
      </div>

      {/* Right/Preview */}
      <div
        className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-lg flex-1 bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
        style={{
          backgroundImage: "linear-gradient(135deg, #2b7cee22 0%, #2b7cee44 100%)",
        }}
      >
        <span className="material-symbols-outlined text-white text-4xl ">
          {previewIcon}
        </span>
      </div>
    </div>
  );    
}

