"use client";

import React from "react";
import { ApplicationResponse, User } from "@/types";
import { Button } from "@/components/ui/Button";

interface ApplicationActionBarProps {
  app: ApplicationResponse;
  user: User | null;
  isAssignedVerifier: boolean;
  updatingStatus: boolean;
  startingInspection: boolean;
  onReview: () => void;
  onRejectReview: () => void;
  onOpenSchedule: () => void;
  onOpenAssign: () => void;
  onStartInspection: () => void;
  onOpenAddObs: () => void;
  onOpenResult: () => void;
  onOpenIssueCert: () => void;
  onSubmitDraft?: () => void;
}

export const ApplicationActionBar: React.FC<ApplicationActionBarProps> = ({
  app,
  user,
  isAssignedVerifier,
  updatingStatus,
  startingInspection,
  onReview,
  onRejectReview,
  onOpenSchedule,
  onOpenAssign,
  onStartInspection,
  onOpenAddObs,
  onOpenResult,
  onOpenIssueCert,
  onSubmitDraft,
}) => {
  const isOfficerOrAdmin = user?.role === "LMO" || user?.role === "ADMIN";
  const isOwnerOrAdmin =
    user?.role === "INSTRUMENT_OWNER" ||
    user?.role === "ADMIN" ||
    user?.id === app.applicant_id;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {app.status === "DRAFT" && isOwnerOrAdmin && onSubmitDraft && (
        <Button
          onClick={onSubmitDraft}
          isLoading={updatingStatus}
          variant="primary"
          size="sm"
        >
          Submit Application
        </Button>
      )}

      {app.status === "SUBMITTED" && isOfficerOrAdmin && (
        <>
          <Button
            onClick={onReview}
            isLoading={updatingStatus}
            variant="primary"
            size="sm"
          >
            Accept for Review
          </Button>
          <Button
            onClick={onRejectReview}
            disabled={updatingStatus}
            variant="danger"
            size="sm"
          >
            Reject Application
          </Button>
        </>
      )}

      {app.status === "UNDER_REVIEW" && isOfficerOrAdmin && (
        <>
          <Button
            onClick={onOpenSchedule}
            variant="primary"
            size="sm"
          >
            Schedule Inspection
          </Button>
          <Button
            onClick={onOpenAssign}
            variant="outline"
            size="sm"
          >
            Assign Verifier
          </Button>
          <Button
            onClick={onRejectReview}
            variant="danger"
            size="sm"
          >
            Reject
          </Button>
        </>
      )}

      {app.status === "SCHEDULED" && (
        <>
          {isAssignedVerifier && (
            <Button
              onClick={onStartInspection}
              isLoading={startingInspection}
              variant="primary"
              size="sm"
            >
              Start Inspection
            </Button>
          )}
          {isOfficerOrAdmin && (
            <>
              <Button
                onClick={onOpenSchedule}
                variant="outline"
                size="sm"
              >
                Reschedule
              </Button>
              <Button
                onClick={onOpenAssign}
                variant="outline"
                size="sm"
              >
                Reassign
              </Button>
            </>
          )}
        </>
      )}

      {app.status === "INSPECTION_IN_PROGRESS" && isAssignedVerifier && (
        <>
          <Button
            onClick={onOpenAddObs}
            variant="secondary"
            size="sm"
          >
            + Add Observation
          </Button>
          <Button
            onClick={onOpenResult}
            variant="primary"
            size="sm"
          >
            Finalize Result
          </Button>
        </>
      )}

      {app.status === "VERIFIED" && isOfficerOrAdmin && (
        <Button
          onClick={onOpenIssueCert}
          variant="primary"
          size="sm"
          className="animate-pulse shadow-md"
        >
          📜 Issue Certificate
        </Button>
      )}
    </div>
  );
};
