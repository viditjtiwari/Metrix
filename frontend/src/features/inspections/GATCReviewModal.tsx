"use client";

import React, { useState } from "react";
import { useReviewGATCReportMutation } from "./inspectionApi";
import { InspectionDetailResponse } from "@/types";
import { ShieldCheck, AlertCircle, X, ExternalLink, CheckCircle, XCircle } from "lucide-react";

interface GATCReviewModalProps {
  inspection: InspectionDetailResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export const GATCReviewModal: React.FC<GATCReviewModalProps> = ({
  inspection,
  onClose,
  onSuccess,
}) => {
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [reviewReport, { isLoading }] = useReviewGATCReportMutation();

  const handleDecision = async (status: "APPROVED" | "REJECTED" | "CLARIFICATION_ASKED") => {
    setError(null);
    if ((status === "REJECTED" || status === "CLARIFICATION_ASKED") && !remarks.trim()) {
      setError(`Please provide remarks/reason for ${status === "REJECTED" ? "rejection" : "clarification"}.`);
      return;
    }

    try {
      await reviewReport({
        inspectionId: inspection.id,
        data: {
          lmo_approval_status: status,
          lmo_approval_remarks: remarks.trim() || undefined,
        },
      }).unwrap();

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(
        (err as { data?: { detail?: string } })?.data?.detail || "Failed to submit review decision."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Review GATC Laboratory Calibration Report
              </h2>
              <p className="text-[11px] text-slate-400">
                Legal Metrology Officer Endorsement & Verification Decision
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-2.5 rounded-lg bg-rose-50 border border-rose-200 p-2 text-xs text-rose-700 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        <div className="mt-3.5 space-y-3 text-xs">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-medium">GATC Recommendation:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
                  inspection.gatc_recommendation === "CERTIFY"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {inspection.gatc_recommendation || "CERTIFY"}
              </span>
            </div>

            <div className="pt-1 border-t border-slate-200/60">
              <span className="text-slate-500 font-medium block mb-1">Calibration Certificate / Report:</span>
              {inspection.gatc_test_report_url ? (
                <a
                  href={inspection.gatc_test_report_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-indigo-600 font-semibold hover:underline"
                >
                  View GATC Report Document <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <span className="text-slate-400 italic">No document link attached</span>
              )}
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Officer Review Remarks / Statutory Endorsement
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Test calibration results verified against National Physical Laboratory (NPL) standards. Approved."
              className="w-full rounded-lg border border-slate-200 p-2.5 text-xs focus:ring-2 focus:ring-indigo-500 bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleDecision("CLARIFICATION_ASKED")}
              className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 font-medium"
            >
              Request Clarification
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleDecision("REJECTED")}
              className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700"
            >
              Reject Report
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleDecision("APPROVED")}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700"
            >
              {isLoading ? "Saving..." : "Approve & Endorse"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
