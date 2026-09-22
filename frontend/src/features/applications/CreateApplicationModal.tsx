"use client";

import React, { useState } from "react";
import { useSearchInstrumentsQuery } from "@/features/instruments/instrumentApi";
import { useCreateApplicationMutation } from "./applicationApi";
import { ApplicationResponse } from "@/types";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

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

  const instrumentOptions = [
    { value: "", label: "-- Select an instrument --" },
    ...instruments.map((inst) => ({
      value: String(inst.id),
      label: `[${inst.registration_number}] ${inst.manufacturer} ${inst.model_name} (S/N: ${inst.serial_number}) - ${inst.location}`,
    })),
  ];

  const appTypeOptions = [
    { value: "INITIAL", label: "Initial Verification" },
    { value: "RE_VERIFICATION", label: "Periodic Re-verification" },
  ];

  return (
    <Modal
      title="New Verification Application"
      subtitle="Submit a legal metrology verification or re-verification request."
      onClose={onClose}
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="outline"
            disabled={isLoading || instruments.length === 0}
            onClick={() => handleAction(false)}
          >
            Save as Draft
          </Button>
          <Button
            variant="primary"
            disabled={isLoading || instruments.length === 0}
            isLoading={isLoading}
            onClick={() => handleAction(true)}
          >
            Submit Application
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="rounded-xl bg-error-container p-3 text-xs text-on-error-container">
            {error}
          </div>
        )}

        {loadingInstruments ? (
          <div className="p-3 border border-surface-variant/40 rounded-xl text-on-surface-variant text-xs">
            Loading registered instruments...
          </div>
        ) : instruments.length === 0 ? (
          <div className="p-3 rounded-xl border border-tertiary/30 bg-tertiary-container/15 text-on-surface text-xs">
            No active instruments found. Please register an instrument first.
          </div>
        ) : (
          <Select
            label="Select Instrument *"
            value={String(instrumentId)}
            onChange={(e) => setInstrumentId(e.target.value)}
            options={instrumentOptions}
          />
        )}

        <Select
          label="Application Type *"
          value={applicationType}
          onChange={(e) => setApplicationType(e.target.value)}
          options={appTypeOptions}
        />

        <div>
          <label className="block text-xs font-semibold text-on-surface mb-1">
            Remarks / Inspection Location Notes
          </label>
          <textarea
            rows={3}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Standard annual calibration check. Site contact: Rajan (9876543210)."
            className="w-full rounded-xl border border-surface-variant/60 bg-surface-container-low px-3 py-2 text-xs text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-hidden resize-none"
          />
        </div>
      </div>
    </Modal>
  );
};
