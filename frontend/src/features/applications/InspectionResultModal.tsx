"use client";

import React, { useState } from "react";
import { InspectionResult } from "@/types";
import { useSubmitInspectionResultMutation } from "./applicationApi";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

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
    <Modal
      title="Finalize Verification Inspection"
      subtitle={`Inspection #${inspectionId}`}
      onClose={onClose}
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={result === "VERIFIED" ? "primary" : "danger"}
            onClick={handleSubmit}
            isLoading={isLoading}
          >
            {`Confirm ${result}`}
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

        <div>
          <label className="block text-xs font-semibold text-on-surface mb-2">
            Verification Determination *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex items-center p-3 rounded-xl border cursor-pointer transition ${
                result === "VERIFIED"
                  ? "border-tertiary bg-tertiary-container/20 text-on-surface font-semibold"
                  : "border-surface-variant/50 hover:bg-surface-container-low text-on-surface-variant"
              }`}
            >
              <input
                type="radio"
                name="result"
                value="VERIFIED"
                checked={result === "VERIFIED"}
                onChange={() => setResult("VERIFIED")}
                className="mr-2 text-tertiary focus:ring-tertiary"
              />
              VERIFIED (Pass)
            </label>

            <label
              className={`flex items-center p-3 rounded-xl border cursor-pointer transition ${
                result === "REJECTED"
                  ? "border-error bg-error-container/20 text-on-surface font-semibold"
                  : "border-surface-variant/50 hover:bg-surface-container-low text-on-surface-variant"
              }`}
            >
              <input
                type="radio"
                name="result"
                value="REJECTED"
                checked={result === "REJECTED"}
                onChange={() => setResult("REJECTED")}
                className="mr-2 text-error focus:ring-error"
              />
              REJECTED (Fail)
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-on-surface mb-1">
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
            className="w-full rounded-xl border border-surface-variant/60 bg-surface-container-low px-3 py-2 text-xs text-on-surface focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-hidden resize-none"
          />
        </div>

        <div className="rounded-xl bg-surface-container-high p-3 text-[11px] text-on-surface-variant border border-surface-variant/30">
          <span className="font-semibold text-on-surface">Notice:</span> Submitting
          this determination will advance the application status to{" "}
          <strong className="text-on-surface">{result}</strong> and complete the
          inspection workflow.
        </div>
      </form>
    </Modal>
  );
}
