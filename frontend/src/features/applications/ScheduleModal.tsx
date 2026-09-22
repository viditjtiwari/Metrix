"use client";

import React, { useState } from "react";
import { useGetVerifiersQuery, useScheduleInspectionMutation } from "./applicationApi";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

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

  const verifierOptions = [
    { value: "", label: "-- Unassigned (Assign later) --" },
    ...verifiers.map((v) => ({
      value: String(v.id),
      label: `${v.full_name} (${v.role}) - ${v.email}`,
    })),
  ];

  return (
    <Modal
      title="Schedule Verification Inspection"
      subtitle={`Application #${applicationId}`}
      onClose={onClose}
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            Confirm Schedule
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="rounded-xl bg-error-container p-3 text-xs text-on-error-container">
            {errorMsg}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Scheduled Date"
            type="date"
            required
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
          />
          <Input
            label="Time Slot"
            type="text"
            placeholder="e.g. 10:30 AM"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
          />
        </div>

        <Input
          label="Inspection Location (Premises / Lab)"
          type="text"
          placeholder="e.g. Dispenser 3, Shell Station, Ring Road"
          value={inspectionLocation}
          onChange={(e) => setInspectionLocation(e.target.value)}
        />

        <Select
          label="Assign Verifier (LMO / GATC)"
          value={assignedToId ? String(assignedToId) : ""}
          onChange={(e) =>
            setAssignedToId(e.target.value ? Number(e.target.value) : undefined)
          }
          options={verifierOptions}
        />

        <div>
          <label className="block text-xs font-semibold text-on-surface mb-1">
            Scheduling Remarks
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Standard working weights required for Span check"
            value={schedulingRemarks}
            onChange={(e) => setSchedulingRemarks(e.target.value)}
            className="w-full rounded-xl border border-surface-variant/60 bg-surface-container-low px-3 py-2 text-xs text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-hidden resize-none"
          />
        </div>
      </form>
    </Modal>
  );
}
