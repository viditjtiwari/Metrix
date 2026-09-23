"use client";

import React from "react";
import { NoticeBoard } from "@/features/notices/NoticeBoard";
import { Megaphone, ShieldCheck, Info } from "lucide-react";

export default function NoticesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
            <Megaphone className="h-4 w-4" />
            Department Bulletins
          </div>
          <h1 className="text-xl font-bold text-slate-900 mt-1">
            Departmental Notices & Circulars
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official statutory guidelines, calibration schedules, and legal metrology directives
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <NoticeBoard />
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5 shadow-xs text-xs space-y-3">
            <div className="flex items-center gap-2 text-blue-900 font-semibold">
              <ShieldCheck className="h-4 w-4 text-blue-700" />
              Statutory Compliance Note
            </div>
            <p className="text-slate-600 leading-relaxed">
              All notifications issued herein carry statutory force under the Legal Metrology Act, 2009. Users and verified testing centres must ensure prompt compliance with announced re-verification schedules.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs text-xs space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-semibold">
              <Info className="h-4 w-4 text-slate-500" />
              About Portal Notices
            </div>
            <p className="text-slate-500 leading-relaxed">
              System Administrators can broadcast circulars and operational updates to all registered instrument owners, test centres, and verification officers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
