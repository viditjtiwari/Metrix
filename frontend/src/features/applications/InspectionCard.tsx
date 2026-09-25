"use client";

import React, { useState } from "react";
import { InspectionDetailResponse } from "@/types";
import { useAppSelector } from "@/store/hooks";
import { GATCReportModal } from "@/features/inspections/GATCReportModal";
import { GATCReviewModal } from "@/features/inspections/GATCReviewModal";
import { FlaskConical, ExternalLink, CheckCircle2, ShieldCheck, Download } from "lucide-react";

interface InspectionCardProps {
  inspection: InspectionDetailResponse;
  onRefresh?: () => void;
}

export function InspectionCard({ inspection, onRefresh }: InspectionCardProps) {
  const { user, token } = useAppSelector((state) => state.auth);
  const [downloading, setDownloading] = useState(false);
  const [showGATCModal, setShowGATCModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleDownloadReport = async () => {
    try {
      setDownloading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/inspections/${inspection.id}/report/download`,
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("metrix_token")}`,
          },
        }
      );
      if (!res.ok) throw new Error("Report download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Inspection_Report_${inspection.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Could not download inspection report PDF. Please ensure you have permission.");
    } finally {
      setDownloading(false);
    }
  };

  const isGatcMode = inspection.inspection_mode === "GATC_LAB";
  const canUploadGATC = (user?.role === "GATC" && inspection.assigned_to_id === user?.id) || user?.role === "ADMIN";
  const canReviewGATC = (user?.role === "LMO" || user?.role === "ADMIN") && Boolean(inspection.gatc_test_report_url);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs text-xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="text-sm font-semibold text-slate-900">
          Inspection & Assignment Information
        </h3>
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
            isGatcMode
              ? "bg-purple-50 text-purple-700 border-purple-200"
              : "bg-blue-50 text-blue-700 border-blue-200"
          }`}
        >
          {isGatcMode ? "🔬 GATC Lab Testing" : "📋 LMO Field Verification"}
        </span>
      </div>

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
            {inspection.started_at ? new Date(inspection.started_at).toLocaleString() : "Pending"}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block">Completed At</span>
          <span className="text-slate-700">
            {inspection.completed_at ? new Date(inspection.completed_at).toLocaleString() : "Pending"}
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

      {/* GATC Laboratory Calibration Report Dossier */}
      {(isGatcMode || inspection.gatc_test_report_url) && (
        <div className="rounded-lg border border-purple-200 bg-purple-50/40 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-purple-900 flex items-center gap-1.5">
              <FlaskConical className="w-3.5 h-3.5" /> GATC Laboratory Calibration Record
            </span>
            <div className="flex items-center gap-2">
              {inspection.gatc_recommendation && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  inspection.gatc_recommendation === "CERTIFY" ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                }`}>
                  Rec: {inspection.gatc_recommendation}
                </span>
              )}
              {inspection.lmo_approval_status && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-800">
                  LMO: {inspection.lmo_approval_status.replace(/_/g, " ")}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-purple-200/50">
            {inspection.gatc_test_report_url ? (
              <a
                href={inspection.gatc_test_report_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-700 font-medium hover:underline inline-flex items-center gap-1"
              >
                View GATC Calibration Certificate <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="text-slate-400 italic">No GATC calibration report submitted yet</span>
            )}

            <div className="flex items-center gap-2">
              {canUploadGATC && (
                <button
                  onClick={() => setShowGATCModal(true)}
                  className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white font-medium text-[11px]"
                >
                  Upload Lab Report
                </button>
              )}
              {canReviewGATC && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-[11px]"
                >
                  Review GATC Report
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Seal Details if available */}
      {inspection.seal_number && (
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
          <div>
            <span className="text-slate-400 block">Official Seal Number</span>
            <span className="font-mono font-bold text-slate-800">{inspection.seal_number}</span>
          </div>
          <div>
            <span className="text-slate-400 block">Stamp Quarter</span>
            <span className="font-semibold text-emerald-700">{inspection.stamp_quarter || "—"}</span>
          </div>
        </div>
      )}

      {inspection.result_remarks && (
        <div className="pt-2 border-t border-slate-100 text-slate-600">
          <span className="font-semibold text-slate-800">Decision Notes:</span> {inspection.result_remarks}
        </div>
      )}

      {/* Download Official Inspection Report */}
      {inspection.result && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleDownloadReport}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? "Downloading Report..." : "Download Official Inspection Report (PDF)"}
          </button>
        </div>
      )}

      {showGATCModal && (
        <GATCReportModal
          inspectionId={inspection.id}
          applicationNumber={inspection.application_number || undefined}
          onClose={() => setShowGATCModal(false)}
          onSuccess={() => onRefresh?.()}
        />
      )}

      {showReviewModal && (
        <GATCReviewModal
          inspection={inspection}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => onRefresh?.()}
        />
      )}
    </div>
  );
}
