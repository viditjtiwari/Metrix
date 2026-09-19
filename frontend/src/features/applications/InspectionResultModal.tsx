"use client";

import React, { useState } from "react";
import { InspectionResult } from "@/types";
import { useSubmitInspectionResultMutation } from "./applicationApi";

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
  const [result, setResult] = useState<InspectionResult>("VERIFIED");
  const [remarks, setRemarks] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [submitResult, { isLoading }] = useSubmitInspectionResultMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await submitResult({
        inspectionId,
        applicationId,
        data: {
          result,
          remarks: remarks.trim() || undefined,
        },
      }).unwrap();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errDetail =
        (err as { data?: { detail?: string } })?.data?.detail ||
        "Failed to submit inspection result.";
      setErrorMsg(errDetail);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-semibold text-slate-900">
            Finalize Verification Inspection
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="mt-4 rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-2">
              Verification Determination *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition ${
                  result === "VERIFIED"
                    ? "border-emerald-500 bg-emerald-50/50 text-emerald-900 font-semibold"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="result"
                  value="VERIFIED"
                  checked={result === "VERIFIED"}
                  onChange={() => setResult("VERIFIED")}
                  className="mr-2 text-emerald-600 focus:ring-emerald-500"
                />
                VERIFIED (Pass)
              </label>

              <label
                className={`flex items-center p-3 rounded-lg border cursor-pointer transition ${
                  result === "REJECTED"
                    ? "border-rose-500 bg-rose-50/50 text-rose-900 font-semibold"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="result"
                  value="REJECTED"
                  checked={result === "REJECTED"}
                  onChange={() => setResult("REJECTED")}
                  className="mr-2 text-rose-600 focus:ring-rose-500"
                />
                REJECTED (Fail)
              </label>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Final Decision Remarks / Justification
            </label>
            <textarea
              rows={3}
              placeholder={
                result === "VERIFIED"
                  ? "e.g. Instrument meets all legal metrological standards and error limits."
                  : "e.g. Maximum permissible error exceeded during capacity span check."
              }
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-[11px] text-amber-800">
            <span className="font-semibold">Notice:</span> Submitting this determination
            will advance the application status to <strong>{result}</strong> and complete
            the inspection workflow.
          </div>

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`px-4 py-1.5 rounded-lg font-semibold text-white transition disabled:opacity-50 ${
                result === "VERIFIED"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700"
              }`}
            >
              {isLoading ? "Submitting..." : `Confirm ${result}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
