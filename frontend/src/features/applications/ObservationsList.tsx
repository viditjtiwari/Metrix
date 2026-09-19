"use client";

import React from "react";
import { ObservationResponse } from "@/types";

interface ObservationsListProps {
  observations: ObservationResponse[];
  onAddClick?: () => void;
  canAdd?: boolean;
}

export function ObservationsList({
  observations,
  onAddClick,
  canAdd = false,
}: ObservationsListProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">
            Inspection Test Observations ({observations.length})
          </h4>
          <p className="text-xs text-slate-500">
            Recorded verification specifications and error tolerances.
          </p>
        </div>
        {canAdd && onAddClick && (
          <button
            onClick={onAddClick}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition shadow-xs"
          >
            + Add Observation
          </button>
        )}
      </div>

      {observations.length === 0 ? (
        <div className="text-center py-6 text-xs text-slate-400">
          No test observations recorded yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-2 px-3">#</th>
                <th className="py-2 px-3">Parameter</th>
                <th className="py-2 px-3">Observed Value</th>
                <th className="py-2 px-3">Reference Standard</th>
                <th className="py-2 px-3">Result</th>
                <th className="py-2 px-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {observations.map((obs, idx) => (
                <tr key={obs.id} className="hover:bg-slate-50 transition">
                  <td className="py-2.5 px-3 text-slate-400">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                    {obs.parameter_name}
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="font-mono font-medium">
                      {obs.observed_value}
                    </span>{" "}
                    {obs.unit && <span className="text-slate-500">{obs.unit}</span>}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">
                    {obs.standard_value ? (
                      <span className="font-mono">{obs.standard_value}</span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        obs.is_passed
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {obs.is_passed ? "PASSED" : "FAILED"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-500 max-w-xs truncate">
                    {obs.remarks || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
