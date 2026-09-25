"use client";

import React, { useState } from "react";
import { useSubmitGATCReportMutation } from "./inspectionApi";
import { FlaskConical, AlertCircle, X, CheckCircle2, FileText } from "lucide-react";

interface GATCReportModalProps {
  inspectionId: number;
  applicationNumber?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const GATCReportModal: React.FC<GATCReportModalProps> = ({
  inspectionId,
  applicationNumber,
  onClose,
  onSuccess,
}) => {
  const [reportUrl, setReportUrl] = useState("");
  const [recommendation, setRecommendation] = useState<"CERTIFY" | "REJECT">("CERTIFY");
  const [paramName, setParamName] = useState("Calibration Drift / Repeatability");
  const [observedVal, setObservedVal] = useState("Within MPE tolerance");
  const [standardVal, setStandardVal] = useState("Standard Weight M1 Class");
  const [unit, setUnit] = useState("mg");
  const [error, setError] = useState<string | null>(null);

  const [submitReport, { isLoading }] = useSubmitGATCReportMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reportUrl.trim()) {
      setError("Please provide the GATC Laboratory Calibration Report URL or document reference.");
      return;
    }

    try {
      await submitReport({
        inspectionId,
        data: {
          gatc_test_report_url: reportUrl.trim(),
          gatc_recommendation: recommendation,
          observations: [
            {
              parameter_name: paramName.trim(),
              observed_value: observedVal.trim(),
              standard_value: standardVal.trim() || undefined,
              unit: unit.trim() || undefined,
              is_passed: recommendation === "CERTIFY",
            },
          ],
        },
      }).unwrap();

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(
        (err as { data?: { detail?: string } })?.data?.detail || "Failed to submit GATC calibration report."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                GATC Laboratory Calibration Report
              </h2>
              <p className="text-[11px] text-slate-400">
                Submit certified lab test findings for {applicationNumber || `Inspection #${inspectionId}`}
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

        <form onSubmit={handleSubmit} className="mt-3.5 space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              GATC Calibration Certificate / Report URL or Document No. *
            </label>
            <input
              type="text"
              required
              value={reportUrl}
              onChange={(e) => setReportUrl(e.target.value)}
              placeholder="https://... or GATC/TEST/2026/0412"
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-2 focus:ring-purple-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              GATC Laboratory Recommendation *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <label
                className={`flex items-center p-2 rounded-lg border cursor-pointer ${
                  recommendation === "CERTIFY"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold"
                    : "border-slate-200 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="rec"
                  value="CERTIFY"
                  checked={recommendation === "CERTIFY"}
                  onChange={() => setRecommendation("CERTIFY")}
                  className="mr-1.5 text-emerald-600"
                />
                Recommend Certification (Pass)
              </label>
              <label
                className={`flex items-center p-2 rounded-lg border cursor-pointer ${
                  recommendation === "REJECT"
                    ? "border-rose-500 bg-rose-50 text-rose-900 font-semibold"
                    : "border-slate-200 bg-white"
                }`}
              >
                <input
                  type="radio"
                  name="rec"
                  value="REJECT"
                  checked={recommendation === "REJECT"}
                  onChange={() => setRecommendation("REJECT")}
                  className="mr-1.5 text-rose-600"
                />
                Recommend Rejection (Fail)
              </label>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 space-y-2">
            <span className="block font-semibold text-slate-800 text-[10px] uppercase">
              Primary Calibration Observation
            </span>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-600 mb-0.5">Parameter Name</label>
                <input
                  type="text"
                  value={paramName}
                  onChange={(e) => setParamName(e.target.value)}
                  className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-0.5">Observed Calibration Value</label>
                <input
                  type="text"
                  value={observedVal}
                  onChange={(e) => setObservedVal(e.target.value)}
                  className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-600 mb-0.5">Standard Reference Material</label>
                <input
                  type="text"
                  value={standardVal}
                  onChange={(e) => setStandardVal(e.target.value)}
                  className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-0.5">Unit of Measurement</label>
                <input
                  type="text"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  className="w-full rounded border border-slate-200 bg-white px-2 py-1 text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-1.5 rounded-lg bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {isLoading ? "Submitting..." : "Submit Report to LMO"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
