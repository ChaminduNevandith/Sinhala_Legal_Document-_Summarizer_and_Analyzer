import React from "react";

function Modal({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative w-full max-w-4xl mx-4 bg-white dark:bg-[#232831] rounded-xl shadow-lg flex flex-col md:flex-row overflow-hidden">
        <button
          className="absolute top-3 right-3 z-10 rounded-full bg-slate-200 dark:bg-slate-700 p-2 hover:bg-slate-300 dark:hover:bg-slate-600"
          onClick={onClose}
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
        {children}
      </div>
    </div>
  );
}

export default Modal;
