"use client";

import React from "react";
import Link from "next/link";
import { Scale, Award, FileText, Megaphone, Calculator, ArrowRight, ArrowUpRight } from "lucide-react";

export const QuickNavPanel: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Quick Navigation
        </h3>
        <div className="space-y-2.5">
          <Link
            href="/instruments"
            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <Scale size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition">
                  Instruments Registry
                </div>
                <div className="text-[11px] text-slate-400">Manage weighing devices</div>
              </div>
            </div>
            <ArrowUpRight size={14} className="text-slate-400 group-hover:text-emerald-700" />
          </Link>

          <Link
            href="/certificates"
            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Award size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition">
                  Digital Certificates
                </div>
                <div className="text-[11px] text-slate-400">Download official PDFs</div>
              </div>
            </div>
            <ArrowUpRight size={14} className="text-slate-400 group-hover:text-blue-700" />
          </Link>

          <Link
            href="/fees"
            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <Calculator size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-amber-700 transition">
                  Fee Calculator
                </div>
                <div className="text-[11px] text-slate-400">Schedule XII & Rule 14</div>
              </div>
            </div>
            <ArrowUpRight size={14} className="text-slate-400 group-hover:text-amber-700" />
          </Link>

          <Link
            href="/reports"
            className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100 transition group"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
                <FileText size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800 group-hover:text-violet-700 transition">
                  Operational Reports
                </div>
                <div className="text-[11px] text-slate-400">Export audit CSVs</div>
              </div>
            </div>
            <ArrowUpRight size={14} className="text-slate-400 group-hover:text-violet-700" />
          </Link>
        </div>
      </div>

      {/* Department Circulars Card */}
      <div className="bg-gradient-to-br from-blue-700 to-indigo-800 text-white rounded-2xl p-5 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider">
          <Megaphone size={14} />
          <span>Statutory Circulars</span>
        </div>
        <h4 className="text-sm font-bold mt-1 text-white leading-snug">
          Department Directives
        </h4>
        <p className="text-[11px] text-blue-100 mt-1 leading-relaxed">
          Review legal metrology circulars, re-verification schedules, and testing guidelines.
        </p>
        <Link
          href="/notices"
          className="mt-3.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-semibold backdrop-blur-xs transition"
        >
          <span>Open Bulletins</span>
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
};
