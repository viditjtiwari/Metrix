"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface RejectModalProps {
  isOpen: boolean;
  applicationNumber: string;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  isLoading?: boolean;
}

export function RejectModal({
  isOpen,
  applicationNumber,
  onClose,
  onConfirm,
  isLoading = false,
}: RejectModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please provide a reason for rejection.");
      return;
    }
    setError(null);
    try {
      await onConfirm(reason.trim());
      setReason("");
      onClose();
    } catch {
      // Error handled by parent or caught here
    }
  };

  return (
    <Modal
      title="Reject Verification Application"
      subtitle={`Application: ${applicationNumber}`}
      onClose={onClose}
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!reason.trim()}
          >
            Confirm Rejection
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-xs text-on-surface-variant">
          Please enter the official statutory grounds or technical deficiency
          for rejecting this verification application. This will be recorded in
          the audit log and communicated to the applicant.
        </p>

        {error && (
          <div className="p-2.5 rounded-lg bg-error-container text-on-error-container text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-on-surface mb-1">
            Reason for Rejection *
          </label>
          <textarea
            required
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Non-compliance with OIML R76 standards, missing calibration weights certificate, or incomplete specifications."
            className="w-full rounded-xl border border-surface-variant/60 bg-surface-container-low px-3 py-2 text-xs text-on-surface focus:border-error focus:ring-1 focus:ring-error focus:outline-hidden resize-none"
          />
        </div>
      </form>
    </Modal>
  );
}
