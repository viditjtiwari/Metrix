"use client";

import React, { useState } from "react";
import { useGetDiscrepancyReportsQuery } from "@/features/discrepancy/discrepancyApi";
import {
  ReportCard,
  STATUS_BADGE,
} from "@/features/discrepancy/components/ReportCard";
import { ShieldAlert, ChevronDown } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "", label: "All Reports" },
  { value: "PENDING", label: "Pending" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "DISMISSED", label: "Dismissed" },
];

export default function ComplaintsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data, isLoading, isFetching } = useGetDiscrepancyReportsQuery({
    status: statusFilter || undefined,
    page,
    page_size: 15,
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-rose-600" />
            Discrepancy Reports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Citizen-filed complaints about suspicious or tampered certificates
          </p>
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Stats Bar */}
      {data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATUS_OPTIONS.filter((s) => s.value).map((s) => {
            const count =
              !statusFilter && data
                ? data.items.filter((i) => i.status === s.value).length
                : s.value === statusFilter
                ? data.total
                : "—";
            return (
              <button
                key={s.value}
                onClick={() => {
                  setStatusFilter(s.value === statusFilter ? "" : s.value);
                  setPage(1);
                }}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition ${
                  statusFilter === s.value
                    ? "bg-blue-50 border-blue-200 text-blue-700"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {STATUS_BADGE[s.value]?.icon}
                <span>{s.label}</span>
                <span className="ml-auto font-bold">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && data && data.items.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <ShieldAlert className="h-12 w-12 text-slate-300 mx-auto" />
          <h3 className="mt-3 text-sm font-semibold text-slate-700">
            No discrepancy reports found
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {statusFilter
              ? `No reports with status "${statusFilter.replace("_", " ")}"`
              : "No citizen complaints have been filed yet"}
          </p>
        </div>
      )}

      {/* Report Cards */}
      {data && data.items.length > 0 && (
        <div className="space-y-3">
          {data.items.map((report) => (
            <ReportCard
              key={report.id}
              report={report}
              isExpanded={expandedId === report.id}
              onToggle={() =>
                setExpandedId(expandedId === report.id ? null : report.id)
              }
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.total > 15 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-slate-500">
            Page {data.page} of {Math.ceil(data.total / 15)}
            {" · "}
            {data.total} total
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * 15 >= data.total}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {isFetching && !isLoading && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white text-xs px-3 py-1.5 rounded-full shadow-lg animate-pulse">
          Refreshing...
        </div>
      )}
    </div>
  );
}
