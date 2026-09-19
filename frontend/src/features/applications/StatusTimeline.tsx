"use client";

import React from "react";
import { StatusHistoryResponse } from "@/types";

interface StatusTimelineProps {
  history: StatusHistoryResponse[];
}

export function StatusTimeline({ history }: StatusTimelineProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs text-xs space-y-3 h-fit">
      <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
        Status Audit History ({history.length})
      </h3>
      <div className="space-y-4 pt-1">
        {history.map((h) => (
          <div key={h.id} className="relative pl-5 border-l-2 border-slate-200 pb-2">
            <span className="absolute -left-[5px] top-1 h-2 w-2 rounded-full bg-emerald-600" />
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">{h.to_status}</span>
              <span className="text-[10px] text-slate-400">
                {new Date(h.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block">
              {new Date(h.created_at).toLocaleDateString()}
            </span>
            {h.remarks && (
              <p className="mt-1 text-slate-600 text-[11px] bg-slate-50 p-1.5 rounded">
                {h.remarks}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
