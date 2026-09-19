"use client";

import React, { useState } from "react";
import { useAssignVerifierMutation, useGetVerifiersQuery } from "./applicationApi";

interface AssignModalProps {
  applicationId: number;
  currentVerifierId?: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function AssignModal({
  applicationId,
  currentVerifierId,
  onClose,
  onSuccess,
}: AssignModalProps) {
  const [assignedToId, setAssignedToId] = useState<number | "">(
    currentVerifierId || ""
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: verifiers = [], isLoading: loadingVerifiers } =
    useGetVerifiersQuery();
  const [assignVerifier, { isLoading }] = useAssignVerifierMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignedToId) {
      setErrorMsg("Please select a verifier to assign.");
      return;
    }
    setErrorMsg(null);
    try {
      await assignVerifier({
        id: applicationId,
        data: { assigned_to_id: Number(assignedToId) },
      }).unwrap();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errDetail =
        (err as { data?: { detail?: string } })?.data?.detail ||
        "Failed to assign verifier.";
      setErrorMsg(errDetail);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-semibold text-slate-900">
            Assign Officer / Test Centre
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
              Select Verifier (LMO / GATC) *
            </label>
            {loadingVerifiers ? (
              <div className="text-slate-500 py-2">Loading available officers...</div>
            ) : (
              <select
                required
                value={assignedToId}
                onChange={(e) =>
                  setAssignedToId(
                    e.target.value ? Number(e.target.value) : ""
                  )
                }
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-hidden"
              >
                <option value="">-- Choose an Officer or Test Centre --</option>
                {verifiers.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.full_name} ({v.role}) - {v.email}
                  </option>
                ))}
              </select>
            )}
            <p className="mt-1.5 text-[11px] text-slate-500">
              Only Legal Metrology Officers (LMO) and Government Approved Test Centres (GATC) are eligible.
            </p>
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
              disabled={isLoading || !assignedToId}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
            >
              {isLoading ? "Assigning..." : "Assign Verifier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
