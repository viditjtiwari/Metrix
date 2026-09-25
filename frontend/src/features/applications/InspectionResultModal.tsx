"use client";

import React, { useState } from "react";
import { InspectionResult } from "@/types";
import { useSubmitInspectionChecklistMutation } from "./applicationApi";

interface InspectionResultModalProps {
  inspectionId: number;
  applicationId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function InspectionResultModal({
  inspectionId,
  applicationId,
  onClose,
  onSuccess,
}: InspectionResultModalProps) {
  const [sealIntact, setSealIntact] = useState(true);
  const [displayReadable, setDisplayReadable] = useState(true);
  const [levelingOk, setLevelingOk] = useState(true);
  const [powerStable, setPowerStable] = useState(true);
  const [overallCondition, setOverallCondition] = useState<"Good" | "Fair" | "Poor">("Good");

  const [zeroError, setZeroError] = useState("0.0");
  const [eccentricityPassed, setEccentricityPassed] = useState(true);
  const [repeatabilityPassed, setRepeatabilityPassed] = useState(true);
  const [discriminationPassed, setDiscriminationPassed] = useState(true);

  const [sealNumber, setSealNumber] = useState("");
  const [result, setResult] = useState<InspectionResult>("VERIFIED");
  const [remarks, setRemarks] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [submitChecklist, { isLoading }] = useSubmitInspectionChecklistMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (result === "VERIFIED" && !sealNumber.trim()) {
      setErrorMsg("Physical seal number is required when verification passes.");
      return;
    }

    try {
      await submitChecklist({
        inspectionId,
        applicationId,
        data: {
          physical_inspection: {
            seal_intact: sealIntact,
            display_readable: displayReadable,
            leveling_ok: levelingOk,
            power_stable: powerStable,
            overall_condition: overallCondition,
            remarks: remarks.trim() || undefined,
          },
          metrological_tests: {
            zero_error_observed: zeroError.trim() || "0.0",
            zero_error_passed: true,
            span_tests: [{
              load_percentage: 100,
              standard_value: "Capacity",
              observed_value: "Within MPE",
              is_passed: result === "VERIFIED",
            }],
            eccentricity_passed: eccentricityPassed,
            repeatability_passed: repeatabilityPassed,
            discrimination_passed: discriminationPassed,
          },
          seal_number: result === "VERIFIED" ? sealNumber.trim() : undefined,
          result,
          result_remarks: remarks.trim() || undefined,
        },
      }).unwrap();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(
        (err as { data?: { detail?: string } })?.data?.detail || "Failed to submit inspection checklist."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl my-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Government-Standard Inspection Report</h3>
            <p className="text-[11px] text-slate-500">Legal Metrology (General) Rules, 2011</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>

        {errorMsg && (
          <div className="mt-3 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-3 space-y-3 text-xs">
          {/* Section 1: Physical Checklist */}
          <div className="rounded-lg border border-slate-200 p-3 space-y-2 bg-slate-50/50">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
              1. Physical Inspection Checklist
            </span>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={sealIntact} onChange={(e) => setSealIntact(e.target.checked)} className="rounded text-emerald-600" />
                Seal Intact
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={displayReadable} onChange={(e) => setDisplayReadable(e.target.checked)} className="rounded text-emerald-600" />
                Display Readable
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={levelingOk} onChange={(e) => setLevelingOk(e.target.checked)} className="rounded text-emerald-600" />
                Leveling & Alignment
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={powerStable} onChange={(e) => setPowerStable(e.target.checked)} className="rounded text-emerald-600" />
                Power Stable
              </label>
            </div>
            <div className="pt-1 flex items-center gap-2">
              <label className="font-medium text-slate-600">Overall Condition:</label>
              <select
                value={overallCondition}
                onChange={(e) => setOverallCondition(e.target.value as "Good" | "Fair" | "Poor")}
                className="h-7 rounded border border-slate-300 px-2 text-xs bg-white"
              >
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
          </div>

          {/* Section 2: Metrological Tests */}
          <div className="rounded-lg border border-slate-200 p-3 space-y-2 bg-slate-50/50">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
              2. Metrological Tests (OIML R76)
            </span>
            <div className="grid grid-cols-2 gap-2 text-slate-700">
              <div>
                <label className="block text-slate-600 mb-0.5">Zero Error</label>
                <input
                  type="text"
                  value={zeroError}
                  onChange={(e) => setZeroError(e.target.value)}
                  placeholder="0.0g"
                  className="w-full h-7 rounded border border-slate-300 px-2 text-xs bg-white"
                />
              </div>
              <div className="space-y-1 pt-3">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={eccentricityPassed} onChange={(e) => setEccentricityPassed(e.target.checked)} className="rounded text-emerald-600" />
                  Eccentricity Passed
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" checked={repeatabilityPassed} onChange={(e) => setRepeatabilityPassed(e.target.checked)} className="rounded text-emerald-600" />
                  Repeatability Passed
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Result & Seal */}
          <div className="rounded-lg border border-slate-200 p-3 space-y-2.5 bg-slate-50/50">
            <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px] block">
              3. Verification Determination & Seal
            </span>
            <div className="grid grid-cols-2 gap-2">
              <label className={`flex items-center p-2 rounded-lg border cursor-pointer ${result === "VERIFIED" ? "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold" : "border-slate-200 bg-white"}`}>
                <input type="radio" name="result" value="VERIFIED" checked={result === "VERIFIED"} onChange={() => setResult("VERIFIED")} className="mr-1.5 text-emerald-600" />
                VERIFIED (Pass)
              </label>
              <label className={`flex items-center p-2 rounded-lg border cursor-pointer ${result === "REJECTED" ? "border-rose-500 bg-rose-50 text-rose-900 font-semibold" : "border-slate-200 bg-white"}`}>
                <input type="radio" name="result" value="REJECTED" checked={result === "REJECTED"} onChange={() => setResult("REJECTED")} className="mr-1.5 text-rose-600" />
                REJECTED (Fail)
              </label>
            </div>

            {result === "VERIFIED" && (
              <div>
                <label className="block font-medium text-slate-700 mb-0.5">Physical Seal Number Affixed *</label>
                <input
                  type="text"
                  required
                  value={sealNumber}
                  onChange={(e) => setSealNumber(e.target.value)}
                  placeholder="e.g. SL-DEL-2026-0042"
                  className="w-full h-7 rounded border border-slate-300 px-2 font-mono text-xs bg-white"
                />
              </div>
            )}

            <div>
              <label className="block font-medium text-slate-700 mb-0.5">Remarks / Standards Adherence</label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Observed tolerances comply with Legal Metrology Act Schedule VII..."
                className="w-full rounded border border-slate-300 p-1.5 text-xs bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button" onClick={onClose} disabled={isLoading} className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-1.5 rounded-lg font-semibold text-white transition disabled:opacity-50 ${result === "VERIFIED" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}`}
            >
              {isLoading ? "Saving..." : "Submit Inspection Checklist"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
