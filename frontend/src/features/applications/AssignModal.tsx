"use client";

import React, { useState } from "react";
import { useAssignVerifierMutation, useGetVerifiersQuery } from "./applicationApi";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";

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

  const verifierOptions = [
    { value: "", label: "-- Choose an Officer or Test Centre --" },
    ...verifiers.map((v) => ({
      value: String(v.id),
      label: `${v.full_name} (${v.role}) - ${v.email}`,
    })),
  ];

  return (
    <Modal
      title="Assign Officer / Test Centre"
      subtitle={`Application #${applicationId}`}
      onClose={onClose}
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isLoading}
            disabled={!assignedToId}
          >
            Confirm Assignment
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

        {loadingVerifiers ? (
          <div className="text-on-surface-variant text-xs py-2">
            Loading available officers...
          </div>
        ) : (
          <Select
            label="Select Verifier (LMO / GATC) *"
            value={assignedToId ? String(assignedToId) : ""}
            onChange={(e) =>
              setAssignedToId(e.target.value ? Number(e.target.value) : "")
            }
            options={verifierOptions}
            helperText="Only Legal Metrology Officers (LMO) and Government Approved Test Centres (GATC) are eligible."
          />
        )}
      </form>
    </Modal>
  );
}
