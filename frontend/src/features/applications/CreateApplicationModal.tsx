"use client";

import React, { useState } from "react";
import { useSearchInstrumentsQuery } from "@/features/instruments/instrumentApi";
import { useCreateApplicationMutation } from "./applicationApi";
import { ApplicationResponse } from "@/types";

interface CreateApplicationModalProps {
  preselectedInstrumentId?: number;
  onClose: () => void;
  onSuccess: (app: ApplicationResponse) => void;
}

export const CreateApplicationModal: React.FC<CreateApplicationModalProps> = ({
  preselectedInstrumentId,
  onClose,
  onSuccess,
}) => {
  const [instrumentId, setInstrumentId] = useState<number | string>(
    preselectedInstrumentId || ""
  );
  const [applicationType, setApplicationType] = useState<string>("INITIAL");
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data: instrumentsData, isLoading: loadingInstruments } =
    useSearchInstrumentsQuery({ page_size: 100 });
  const [createApplication, { isLoading }] = useCreateApplicationMutation();

  const handleAction = async (submitNow: boolean) => {
    setError(null);
    const selectedId = Number(instrumentId);
    if (!selectedId || isNaN(selectedId)) {
      setError("Please select an instrument.");
      return;
    }

    try {
      const created = await createApplication({
        instrument_id: selectedId,
        application_type: applicationType,
        remarks: remarks.trim() || undefined,
        submit_now: submitNow,
      }).unwrap();

      onSuccess(created);
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { data?: { detail?: string } })?.data?.detail ||
        "Failed to create application. Please check input parameters.";
      setError(msg);
    }
  };

  const instruments = instrumentsData?.items || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              New Verification Application
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit a legal metrology verification or re-verification request.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Select Instrument <span className="text-rose-500">*</span>
            </label>
            {loadingInstruments ? (
              <div className="p-2 border border-slate-200 rounded-lg text-slate-400">
                Loading registered instruments...
              </div>
            ) : instruments.length === 0 ? (
              <div className="p-3 border border-amber-200 bg-amber-50 rounded-lg text-amber-800">
                No active instruments found. Please register an instrument first.
              </div>
            ) : (
              <select
                value={instrumentId}
                onChange={(e) => setInstrumentId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="">-- Select an instrument --</option>
                {instruments.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    [{inst.registration_number}] {inst.manufacturer} {inst.model_name} (S/N: {inst.serial_number}) - {inst.location}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Application Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={applicationType}
              onChange={(e) => setApplicationType(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="INITIAL">Initial Verification</option>
              <option value="RE_VERIFICATION">Periodic Re-verification</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Remarks / Inspection Location Notes
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Standard annual calibration check. Site contact: Rajan (9876543210)."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isLoading || instruments.length === 0}
              onClick={() => handleAction(false)}
              className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50 transition"
            >
              {isLoading ? "Saving..." : "Save as Draft"}
            </button>
            <button
              type="button"
              disabled={isLoading || instruments.length === 0}
              onClick={() => handleAction(true)}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {isLoading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
