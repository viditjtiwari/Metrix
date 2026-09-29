"use client";

import React, { useState } from "react";
import {
  DiscrepancyReport,
  useActionDiscrepancyReportMutation,
} from "@/features/discrepancy/discrepancyApi";
import {
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  ChevronDown,
  AlertTriangle,
  ExternalLink,
  User,
  Phone,
  FileText,
  MessageSquare,
  ShieldAlert,
} from "lucide-react";

export const STATUS_BADGE: Record<
  string,
  { bg: string; text: string; icon: React.ReactNode }
> = {
  PENDING: {
    bg: "bg-amber-50 border-amber-200",
    text: "text-amber-700",
    icon: <Clock size={13} />,
  },
  UNDER_REVIEW: {
    bg: "bg-blue-50 border-blue-200",
    text: "text-blue-700",
    icon: <Search size={13} />,
  },
  RESOLVED: {
    bg: "bg-emerald-50 border-emerald-200",
    text: "text-emerald-700",
    icon: <CheckCircle2 size={13} />,
  },
  DISMISSED: {
    bg: "bg-slate-100 border-slate-300",
    text: "text-slate-500",
    icon: <XCircle size={13} />,
  },
};

export const TYPE_LABELS: Record<string, string> = {
  TAMPERED_PHYSICAL_SEAL: "Tampered / Snipped Physical Seal",
  EXPIRED_STAMP_IN_USE: "Expired Instrument Actively in Use",
  SERIAL_MISMATCH: "Serial Number Mismatch",
  LOCATION_MISMATCH: "Uncertified Location",
  OTHER: "Other Irregularity",
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_BADGE[status] || STATUS_BADGE.PENDING;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${s.bg} ${s.text}`}
    >
      {s.icon}
      {status.replace("_", " ")}
    </span>
  );
}

interface ReportCardProps {
  report: DiscrepancyReport;
  isExpanded: boolean;
  onToggle: () => void;
}

export function ReportCard({ report, isExpanded, onToggle }: ReportCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border transition-shadow ${
        isExpanded
          ? "border-blue-200 shadow-md ring-1 ring-blue-100"
          : "border-slate-200 hover:shadow-sm"
      }`}
    >
      {/* Header Row */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 text-left"
      >
        <div
          className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
            report.status === "PENDING"
              ? "bg-amber-100 text-amber-600"
              : report.status === "UNDER_REVIEW"
              ? "bg-blue-100 text-blue-600"
              : report.status === "RESOLVED"
              ? "bg-emerald-100 text-emerald-600"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          <AlertTriangle size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-800">
              {report.report_reference_id}
            </span>
            <StatusBadge status={report.status} />
          </div>
          <div className="flex items-center gap-3 mt-0.5 text-[11px] text-slate-500">
            <span>{TYPE_LABELS[report.discrepancy_type] || report.discrepancy_type}</span>
            <span>·</span>
            <span>Cert: {report.certificate_number || "N/A"}</span>
            <span>·</span>
            <span>
              {new Date(report.created_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Expanded Details */}
      {isExpanded && <ExpandedDetails report={report} />}
    </div>
  );
}

function ExpandedDetails({ report }: { report: DiscrepancyReport }) {
  const [actionStatus, setActionStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const [actionReport, { isLoading: isActioning }] =
    useActionDiscrepancyReportMutation();

  const handleAction = async () => {
    if (!actionStatus) return;
    try {
      await actionReport({
        id: report.id,
        data: {
          status: actionStatus,
          action_remarks: remarks.trim() || undefined,
        },
      }).unwrap();
      setActionStatus("");
      setRemarks("");
    } catch {
      alert("Failed to update report. Please try again.");
    }
  };

  return (
    <div className="border-t border-slate-100 px-4 py-4 space-y-4">
      {/* Description */}
      <div>
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
          <FileText size={12} /> Complaint Description
        </h4>
        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-3 border border-slate-100">
          {report.description}
        </p>
      </div>

      {/* Reporter + Evidence Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <div className="text-[10px] font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1">
            <User size={11} /> Reporter
          </div>
          <p className="text-xs font-medium text-slate-700">
            {report.reporter_name || "Anonymous"}
          </p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <div className="text-[10px] font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1">
            <Phone size={11} /> Contact
          </div>
          <p className="text-xs font-medium text-slate-700">
            {report.reporter_phone || "Not Provided"}
          </p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
          <div className="text-[10px] font-semibold text-slate-400 uppercase mb-1 flex items-center gap-1">
            <ExternalLink size={11} /> Evidence
          </div>
          {report.evidence_image_url ? (
            <a
              href={report.evidence_image_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-blue-600 hover:underline truncate block"
            >
              View Photo
            </a>
          ) : (
            <p className="text-xs text-slate-500">No evidence attached</p>
          )}
        </div>
      </div>

      {/* Review History (if reviewed) */}
      {report.reviewed_by_name && (
        <div className="bg-blue-50/60 border border-blue-100 rounded-lg p-3">
          <div className="text-[10px] font-semibold text-blue-400 uppercase mb-1 flex items-center gap-1">
            <MessageSquare size={11} /> Review Action
          </div>
          <p className="text-xs text-slate-700">
            <span className="font-semibold">{report.reviewed_by_name}</span> set
            status to <StatusBadge status={report.status} />{" "}
            {report.reviewed_at &&
              `on ${new Date(report.reviewed_at).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}`}
          </p>
          {report.action_remarks && (
            <p className="text-xs text-slate-600 mt-1 italic">
              &ldquo;{report.action_remarks}&rdquo;
            </p>
          )}
        </div>
      )}

      {/* Action Panel (only for actionable statuses) */}
      {(report.status === "PENDING" || report.status === "UNDER_REVIEW") && (
        <div className="bg-gradient-to-r from-slate-50 to-blue-50/40 border border-slate-200 rounded-xl p-4">
          <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1.5">
            <ShieldAlert size={14} className="text-blue-600" />
            Take Action
          </h4>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={actionStatus}
              onChange={(e) => setActionStatus(e.target.value)}
              className="flex-shrink-0 appearance-none px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="">Select Action...</option>
              <option value="UNDER_REVIEW">Mark Under Review</option>
              <option value="RESOLVED">Resolve Complaint</option>
              <option value="DISMISSED">Dismiss Report</option>
            </select>
            <input
              type="text"
              placeholder="Remarks (optional)"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
            <button
              onClick={handleAction}
              disabled={!actionStatus || isActioning}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
            >
              {isActioning ? "Updating..." : "Submit"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
