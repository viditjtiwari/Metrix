"use client";

import React from "react";
import { Shield, Lock, Phone } from "lucide-react";

export function DashboardFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white py-3 px-4 lg:px-6 text-[11px] text-slate-500 shrink-0">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 font-semibold text-slate-700">
            <Shield size={13} className="text-emerald-600" />
            <span>METRIX</span>
          </div>
          <span className="text-slate-300">•</span>
          <span>Dept of Consumer Affairs, Govt. of India</span>
          <span className="text-slate-300 hidden md:inline">•</span>
          <span className="hidden md:inline text-slate-400">Legal Metrology Act, 2009</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-slate-600">
            <Lock size={11} className="text-emerald-600" />
            <span>SHA-256 Verified</span>
          </div>
          <a
            href="tel:1915"
            className="flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-medium transition"
          >
            <Phone size={11} />
            <span>NCH: 1915</span>
          </a>
          <span className="text-slate-400">© {currentYear}</span>
        </div>
      </div>
    </footer>
  );
}
