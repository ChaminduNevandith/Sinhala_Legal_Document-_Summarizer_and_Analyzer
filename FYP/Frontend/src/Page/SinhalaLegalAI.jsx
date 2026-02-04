import React from "react";
import FeatureCard from "../Components/FeatureCard.jsx";
import GavelIcon from "@mui/icons-material/Gavel";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import TranslateIcon from "@mui/icons-material/Translate";
import DescriptionIcon from "@mui/icons-material/Description";
import WarningIcon from "@mui/icons-material/Warning";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import HelpIcon from "@mui/icons-material/Help";
import LoginIcon from "@mui/icons-material/Login";
import { Link } from "react-router-dom";

export default function SinhalaLegalAI() {
  return (
    <div className="dark min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-4 py-4 w-full">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center">
              <GavelIcon style={{ color: "white", fontSize: 24 }} />
            </div>
            <h2 className="text-lg font-bold tracking-tight">Sinhala Legal AI</h2>
          </div>

          <Link
            to="/login"
            className="text-white font-semibold text-base px-4 py-2 flex items-center gap-1 rounded-[5px]"
            style={{ background: "linear-gradient(135deg, #2b7cee22 0%, #2b7cee 100%)" }}
          >
            <LoginIcon fontSize="small" />
            Login
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 w-full pb-36">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <section className="px-6 pt-10 pb-8 text-center">
            <div className="mx-auto max-w-2xl">
              <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4 text-slate-900 dark:text-white">
                සිංහල නීති ලේඛන සරලව තේරුම් ගන්න
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-base sm:text-lg">
                Your AI-powered assistant for simplifying complex legal documents
                into everyday Sinhala.
              </p>
            </div>
          </section>

          {/* Features/Process Section */}
          <section className="px-4 pb-8">
            {/* Mobile: stacked | Desktop: grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <FeatureCard
                icon={<CloudUploadIcon fontSize="large" />}
                title="Upload Document"
                description="Easily upload your PDF or image files of legal contracts or letters."
                previewIcon={<CloudUploadIcon />}
              />

              <FeatureCard
                icon={<TranslateIcon fontSize="large" />}
                title="Get Sinhala Summary"
                description="AI breaks down complex legal jargon into easy-to-read Sinhala summaries."
                previewIcon={<DescriptionIcon />}
              />

              <FeatureCard
                icon={<WarningIcon fontSize="large" />}
                title="Risk Alerts & Reports"
                description="Identify potential legal risks and download detailed findings instantly."
                previewIcon={<VerifiedUserIcon />}
              />
            </div>
          </section>
        </div>
      </main>

      {/* Fixed Action Bottom Area */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-background-dark/90 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-4 sm:px-6 pt-4 pb-6">
        <div className="max-w-6xl mx-auto">
        {/* Centered button */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <button className="w-full sm:w-auto sm:min-w-[220px] bg-[#1a1a1a] hover:bg-[#1a1a1a]/90 text-white font-bold py-4 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
            Get Started
            </button>
            <button className="w-full sm:w-auto sm:min-w-[220px] bg-white hover:bg-white/90 text-[#1a1a1a] font-bold py-4 px-6 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
            Help
            </button>
        </div>
        </div>
      </footer>
    </div>
  );
}
