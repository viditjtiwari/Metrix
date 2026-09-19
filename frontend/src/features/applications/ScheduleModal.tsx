"use client";

import React, { useState } from "react";
import { useGetVerifiersQuery, useScheduleInspectionMutation } from "./applicationApi";

interface ScheduleModalProps {
  applicationId: number;
  initialDate?: string | null;
  initialTime?: string | null;
  initialLocation?: string | null;
  initialRemarks?: string | null;
  initialVerifierId?: number | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function ScheduleModal({
  applicationId,
  initialDate,
  initialTime,
  initialLocation,
  initialRemarks,
  initialVerifierId,
  onClose,
  onSuccess,
}: ScheduleModalProps) {
  const [scheduledDate, setScheduledDate] = useState(
    initialDate || new Date().toISOString().split("T")[0]
  );
  const [scheduledTime, setScheduledTime] = useState(initialTime || "10:00 AM");
  const [inspectionLocation, setInspectionLocation] = useState(
    initialLocation || ""
  );
  const [schedulingRemarks, setSchedulingRemarks] = useState(
    initialRemarks || ""
  );
  const [assignedToId, setAssignedToId] = useState<number | undefined>(
    initialVerifierId || undefined
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: verifiers = [] } = useGetVerifiersQuery();
  const [scheduleInspection, { isLoading }] = useScheduleInspectionMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await scheduleInspection({
        id: applicationId,
        data: {
          scheduled_date: scheduledDate,
          scheduled_time: scheduledTime || undefined,
          inspection_location: inspectionLocation || undefined,
          scheduling_remarks: schedulingRemarks || undefined,
          assigned_to_id: assignedToId || undefined,
        },
      }).unwrap();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const errDetail =
        (err as { data?: { detail?: string } })?.data?.detail ||
        "Failed to schedule inspection.";
      setErrorMsg(errDetail);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-semibold text-slate-900">
            Schedule Verification Inspection
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Scheduled Date *
              </label>
              <input
                type="date"
                required
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Time Slot
              </label>
              <input
                type="text"
                placeholder="e.g. 10:30 AM"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Inspection Location (Premises / Lab)
            </label>
            <input
              type="text"
              placeholder="e.g. Dispenser 3, Shell Station, Ring Road"
              value={inspectionLocation}
              onChange={(e) => setInspectionLocation(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Assign Verifier (LMO / GATC)
            </label>
            <select
              value={assignedToId || ""}
              onChange={(e) =>
                setAssignedToId(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-hidden"
            >
              <option value="">-- Unassigned (Assign later) --</option>
              {verifiers.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.full_name} ({v.role}) - {v.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Scheduling Remarks
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Standard working weights required for Span check"
              value={schedulingRemarks}
              onChange={(e) => setSchedulingRemarks(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
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
              {isLoading ? "Saving..." : "Confirm Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
