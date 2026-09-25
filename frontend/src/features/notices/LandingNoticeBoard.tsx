"use client";

import React, { useState, useEffect } from "react";
import { Bell, Calendar, Megaphone, ChevronRight, X } from "lucide-react";

interface Notice {
  id: number;
  title: string;
  content: string;
  created_at: string;
  publisher_name: string | null;
}

interface NoticeListResponse {
  items: Notice[];
  total: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const DEFAULT_NOTICES: Notice[] = [
  {
    id: 1,
    title: "SIH26036: Online Verification & Digital Certification Rollout",
    content: "Under Section 24 of the Legal Metrology Act, 2009, all commercial weighing and measuring instruments must be registered and verified through the METRIX portal. Tamper-evident QR-coded certificates are issued upon successful verification.",
    created_at: new Date().toISOString(),
    publisher_name: "Ministry of Consumer Affairs",
  },
  {
    id: 2,
    title: "Statutory Directive: Quarterly Stamping & Re-Verification (Q3-2026)",
    content: "All registered instrument owners must ensure periodic re-verification before the statutory expiry date to avoid compounding penal action under Section 30 of the Legal Metrology Act, 2009.",
    created_at: new Date().toISOString(),
    publisher_name: "Legal Metrology Division",
  },
  {
    id: 3,
    title: "GATC Laboratory Testing Guidelines for High-Capacity Instruments",
    content: "Weighbridges, calibrated storage tanks, and flow meters are auto-routed to accredited Government Approved Test Centres under GATC Rules, 2013.",
    created_at: new Date().toISOString(),
    publisher_name: "DoCA Standards Cell",
  },
];

export function LandingNoticeBoard() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const res = await fetch(`${API_BASE}/notices?limit=5`);
        if (res.ok) {
          const data: NoticeListResponse = await res.json();
          if (data.items && data.items.length > 0) {
            setNotices(data.items);
          } else {
            setNotices(DEFAULT_NOTICES);
          }
        } else {
          setNotices(DEFAULT_NOTICES);
        }
      } catch {
        setNotices(DEFAULT_NOTICES);
      } finally {
        setLoading(false);
      }
    };
    fetchNotices();
  }, []);

  const displayNotices = notices.length > 0 ? notices : DEFAULT_NOTICES;

  return (
    <>
      <div className="rounded-2xl border border-slate-200/90 bg-white shadow-lg shadow-slate-200/50 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-sky-700 to-indigo-800 px-5 py-3.5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15 backdrop-blur-xs ring-1 ring-white/20 shrink-0">
              <Megaphone className="h-5 w-5 text-amber-300 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold tracking-wide uppercase text-white drop-shadow-xs">
                Latest News And Updates
              </h2>
              <p className="text-[11px] text-blue-100 font-medium">
                Official circulars and notifications
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-300/30 text-[10px] font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            LIVE
          </span>
        </div>

        {/* Notice List */}
        <div className="p-3 divide-y divide-slate-100 max-h-[290px] overflow-y-auto">
          {displayNotices.map((notice) => (
            <div
              key={notice.id}
              onClick={() => setSelectedNotice(notice)}
              className="group py-2.5 px-2.5 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-50/90 rounded-lg transition-colors"
            >
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 group-hover:scale-125 transition-transform" />
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug">
                    {notice.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <Calendar className="h-3 w-3 shrink-0" />
                    <span>{new Date(notice.created_at).toLocaleDateString()}</span>
                    {notice.publisher_name && (
                      <>
                        <span>•</span>
                        <span className="truncate">{notice.publisher_name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="bg-slate-50/90 border-t border-slate-100 px-4 py-2 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 flex items-center gap-1.5 font-medium">
            <Bell className="h-3.5 w-3.5 text-blue-600" />
            Statutory metrology directives
          </span>
          <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
            DoCA • GoI
          </span>
        </div>
      </div>

      {/* Notice Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
              <div>
                <span className="inline-block rounded-full bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 text-[10px] mb-1">
                  OFFICIAL NOTICE
                </span>
                <h3 className="text-base font-bold text-slate-900 leading-snug">
                  {selectedNotice.title}
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  Published {new Date(selectedNotice.created_at).toLocaleString()}
                  {selectedNotice.publisher_name && ` by ${selectedNotice.publisher_name}`}
                </p>
              </div>
              <button
                onClick={() => setSelectedNotice(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-4 text-xs leading-relaxed text-slate-700 max-h-72 overflow-y-auto whitespace-pre-wrap">
              {selectedNotice.content}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedNotice(null)}
                className="rounded-lg bg-slate-100 hover:bg-slate-200 px-4 py-1.5 text-xs font-medium text-slate-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
