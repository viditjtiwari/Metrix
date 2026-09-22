"use client";

import React, { useState } from "react";
import { useAddObservationMutation } from "./applicationApi";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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
    <Modal
      title="Record Verification Observation"
      subtitle={`Inspection #${inspectionId}`}
      onClose={onClose}
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            Record Observation
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

        <Input
          label="Test Parameter Name *"
          required
          placeholder="e.g. Zero Load Test, Repeatability, Span Error"
          value={parameterName}
          onChange={(e) => setParameterName(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Observed Value *"
            required
            placeholder="e.g. 0.001"
            value={observedValue}
            onChange={(e) => setObservedValue(e.target.value)}
          />
          <Input
            label="Standard / Reference"
            placeholder="e.g. 0.000"
            value={standardValue}
            onChange={(e) => setStandardValue(e.target.value)}
          />
          <Input
            label="Unit"
            placeholder="e.g. kg, g, L"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2 py-1">
          <input
            type="checkbox"
            id="isPassed"
            checked={isPassed}
            onChange={(e) => setIsPassed(e.target.checked)}
            className="h-4 w-4 rounded border-surface-variant text-tertiary focus:ring-tertiary"
          />
          <label
            htmlFor="isPassed"
            className="text-on-surface font-medium select-none text-xs"
          >
            Parameter Passed Metrological Tolerance
          </label>
        </div>

        <div>
          <label className="block text-xs font-semibold text-on-surface mb-1">
            Observation Remarks / Notes
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Residual error within Class II permissible range"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full rounded-xl border border-surface-variant/60 bg-surface-container-low px-3 py-2 text-xs text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-hidden resize-none"
          />
        </div>
      </form>
    </Modal>
  );
}
