"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ShieldCheck, QrCode, CheckCircle2, Lock, Award, Eye, ExternalLink } from "lucide-react";

export const InteractiveCertificateDemo: React.FC = () => {
  const [isVerified, setIsVerified] = useState(false);

  return (
    <div className="relative mx-auto max-w-xl rounded-3xl border border-emerald-200/90 bg-white/95 p-6 sm:p-7 shadow-xl shadow-emerald-950/5 backdrop-blur-md transition-all duration-300 hover:border-emerald-300">
      {/* Floating Status Chip with Soft Glow */}
      <div className="absolute -top-3.5 right-6 z-20 flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md animate-pulse-glow">
        <ShieldCheck size={13} className="text-emerald-200" />
        <span>Statutory Stamped • Q3-2026</span>
      </div>

      {/* Certificate Header Block */}
      <div className="flex items-start justify-between border-b border-emerald-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Department of Consumer Affairs
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Sec. 24 Compliance</span>
          </div>
          <h3 className="mt-1 text-base font-extrabold text-slate-900 tracking-tight">
            Digital Certificate of Verification
          </h3>
          <p className="font-mono text-xs font-semibold text-emerald-700">
            METRIX-CERT-2026-IND-04829
          </p>
        </div>
        <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 font-serif font-black text-sm shrink-0">
          ⚖️
        </div>
      </div>

      {/* Main Body: Details & Live Scanning QR */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Left 2 Cols: Technical & Verification Data */}
        <div className="sm:col-span-2 space-y-2.5 text-xs">
          <div className="grid grid-cols-2 gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
            <div>
              <span className="block text-[10px] text-slate-400 font-medium">Instrument Model</span>
              <span className="font-semibold text-slate-800">Essae DS-215 (Platform)</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-medium">Capacity / Accuracy</span>
              <span className="font-semibold text-emerald-800">500 kg x 50 g (Class III)</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-medium">Inspecting Officer</span>
              <span className="font-semibold text-slate-800">Insp. R. Sharma (LMO)</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400 font-medium">Issuing Authority</span>
              <span className="font-semibold text-slate-800">Asst. Controller, Metrology</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] px-1 text-slate-500">
            <span>Validity: <strong className="text-slate-800">12 Months (Rule 13)</strong></span>
            <span>Expiry: <strong className="text-emerald-700">23-Sep-2027</strong></span>
          </div>
        </div>

        {/* Right 1 Col: Animated QR Code with Scanning Beam */}
        <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-gradient-to-b from-emerald-50/80 to-white border border-emerald-100 relative group">
          <div className="relative h-24 w-24 rounded-xl bg-white p-1.5 shadow-xs border border-slate-200 overflow-hidden flex items-center justify-center">
            {/* Real SVG QR Pattern Visual */}
            <svg viewBox="0 0 100 100" className="h-full w-full text-slate-900 fill-current">
              <rect x="0" y="0" width="28" height="28" rx="4" fill="#0f172a" />
              <rect x="4" y="4" width="20" height="20" rx="2" fill="#ffffff" />
              <rect x="8" y="8" width="12" height="12" rx="1" fill="#0f172a" />
              <rect x="72" y="0" width="28" height="28" rx="4" fill="#0f172a" />
              <rect x="76" y="4" width="20" height="20" rx="2" fill="#ffffff" />
              <rect x="80" y="8" width="12" height="12" rx="1" fill="#0f172a" />
              <rect x="0" y="72" width="28" height="28" rx="4" fill="#0f172a" />
              <rect x="4" y="76" width="20" height="20" rx="2" fill="#ffffff" />
              <rect x="8" y="80" width="12" height="12" rx="1" fill="#0f172a" />
              <rect x="36" y="8" width="8" height="8" fill="#0f172a" />
              <rect x="52" y="16" width="8" height="8" fill="#0f172a" />
              <rect x="36" y="36" width="28" height="28" rx="2" fill="#059669" />
              <rect x="72" y="44" width="12" height="12" fill="#0f172a" />
              <rect x="44" y="76" width="16" height="8" fill="#0f172a" />
              <rect x="76" y="76" width="16" height="16" fill="#0f172a" />
            </svg>

            {/* Scanning Laser Beam Line Animation */}
            <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent shadow-sm shadow-emerald-500 animate-scanline pointer-events-none" />
          </div>

          <button
            onClick={() => setIsVerified(!isVerified)}
            className="mt-2 text-[10px] font-bold text-emerald-700 hover:text-emerald-900 transition flex items-center gap-1 cursor-pointer"
          >
            <span>{isVerified ? "✓ Verified" : "Simulate Scan"}</span>
          </button>
        </div>
      </div>

      {/* Bottom Integrity Hash Footer */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-500 truncate max-w-[280px] sm:max-w-none">
          <Lock size={12} className="text-emerald-600 shrink-0" />
          <span className="truncate">SHA-256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b...</span>
        </div>
        <Link
          href="/verify/lookup"
          className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 shrink-0 ml-2"
        >
          <span>Verify Live</span>
          <ExternalLink size={11} />
        </Link>
      </div>
    </div>
  );
};
