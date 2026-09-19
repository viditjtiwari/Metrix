"use client";

import React, { useState } from "react";
import { useAddObservationMutation } from "./applicationApi";

interface AddObservationModalProps {
  inspectionId: number;
  applicationId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddObservationModal({
  inspectionId,
  applicationId,
  onClose,
  onSuccess,
}: AddObservationModalProps) {
  const [parameterName, setParameterName] = useState("");
  const [observedValue, setObservedValue] = useState("");
  const [standardValue, setStandardValue] = useState("");
  const [unit, setUnit] = useState("");
  const [isPassed, setIsPassed] = useState(true);
  const [remarks, setRemarks] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [addObservation, { isLoading }] = useAddObservationMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!parameterName.trim() || !observedValue.trim()) {
      setErrorMsg("Parameter name and observed value are required.");
      return;
    }
    setErrorMsg(null);
    try {
      await addObservation({
        inspectionId,
        applicationId,
        data: {
          parameter_name: parameterName.trim(),
          observed_value: observedValue.trim(),
          standard_value: standardValue.trim() || undefined,
          unit: unit.trim() || undefined,
          is_passed: isPassed,
          remarks: remarks.trim() || undefined,
        },
      }).unwrap();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errDetail =
        (err as { data?: { detail?: string } })?.data?.detail ||
        "Failed to record observation.";
      setErrorMsg(errDetail);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-semibold text-slate-900">
            Record Verification Observation
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
            <label className="block font-medium text-slate-700 mb-1">
              Test Parameter Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Zero Load Test, Repeatability, Span Error"
              value={parameterName}
              onChange={(e) => setParameterName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Observed Value *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 0.001, Pass"
                value={observedValue}
                onChange={(e) => setObservedValue(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Standard / Reference
              </label>
              <input
                type="text"
                placeholder="e.g. 0.000, <= 0.005"
                value={standardValue}
                onChange={(e) => setStandardValue(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Unit
              </label>
              <input
                type="text"
                placeholder="e.g. kg, g, L"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 py-1">
            <input
              type="checkbox"
              id="isPassed"
              checked={isPassed}
              onChange={(e) => setIsPassed(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <label htmlFor="isPassed" className="text-slate-800 font-medium select-none">
              Parameter Passed Metrological Tolerance
            </label>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Observation Remarks / Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Residual error within Class II permissible range"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-hidden"
            />
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
              className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Record Observation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
