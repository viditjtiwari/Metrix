"use client";

import React from "react";
import { InspectionDetailResponse } from "@/types";

interface InspectionCardProps {
  inspection: InspectionDetailResponse;
}

export function InspectionCard({ inspection }: InspectionCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs text-xs space-y-3">
      <h3 className="text-sm font-semibold text-slate-900 border-b border-slate-100 pb-2">
        Inspection & Assignment Information
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <span className="text-slate-400 block">Scheduled Date / Time</span>
          <span className="font-medium text-slate-800">
            {inspection.scheduled_date || "Not set"}{" "}
            {inspection.scheduled_time && `at ${inspection.scheduled_time}`}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block">Assigned Verifier</span>
          <span className="font-semibold text-slate-800">
            {inspection.assigned_to_name
              ? `${inspection.assigned_to_name} (${inspection.assigned_to_role})`
              : "Unassigned"}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block">Inspection Location</span>
          <span className="text-slate-800">{inspection.inspection_location || "—"}</span>
        </div>
        <div>
          <span className="text-slate-400 block">Started At</span>
          <span className="text-slate-700">
            {inspection.started_at
              ? new Date(inspection.started_at).toLocaleString()
              : "Pending"}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block">Completed At</span>
          <span className="text-slate-700">
            {inspection.completed_at
              ? new Date(inspection.completed_at).toLocaleString()
              : "Pending"}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block">Inspection Result</span>
          <span
            className={`font-bold ${
              inspection.result === "VERIFIED"
                ? "text-emerald-700"
                : inspection.result === "REJECTED"
                ? "text-rose-700"
                : "text-slate-500"
            }`}
          >
            {inspection.result || "Pending"}
          </span>
        </div>
      </div>
      {inspection.result_remarks && (
        <div className="pt-2 border-t border-slate-100 text-slate-600">
          <span className="font-semibold text-slate-800">Decision Notes:</span>{" "}
          {inspection.result_remarks}
        </div>
      )}
    </div>
  );
}
