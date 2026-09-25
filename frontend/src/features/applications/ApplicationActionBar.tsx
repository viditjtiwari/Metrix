"use client";

import React from "react";
import { ApplicationResponse, User } from "@/types";

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
  onDeleteDraft?: () => void;
  onOpenUploadPayment?: () => void;
  onOpenVerifyPayment?: () => void;
  onOpenClarificationRequest?: () => void;
  onOpenClarificationRespond?: () => void;
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
  onDeleteDraft,
  onOpenUploadPayment,
  onOpenVerifyPayment,
  onOpenClarificationRequest,
  onOpenClarificationRespond,
}) => {
  const isOfficerOrAdmin = user?.role === "LMO" || user?.role === "ADMIN";
  const isOwnerOrAdmin = user?.role === "INSTRUMENT_OWNER" || user?.role === "ADMIN" || user?.id === app.applicant_id;
  const isApplicant = user?.id === app.applicant_id || user?.role === "INSTRUMENT_OWNER";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {app.status === "DRAFT" && isOwnerOrAdmin && (
        <>
          {onSubmitDraft && (
            <button
              onClick={onSubmitDraft}
              disabled={updatingStatus}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
            >
              Submit Application
            </button>
          )}
          {onDeleteDraft && (
            <button
              onClick={onDeleteDraft}
              className="px-3.5 py-1.5 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold transition"
            >
              Delete Draft
            </button>
          )}
        </>
      )}

      {app.status === "SUBMITTED" && (
        <>
          {isApplicant && onOpenUploadPayment && (
            <button
              onClick={onOpenUploadPayment}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition flex items-center gap-1"
            >
              💳 Upload Challan Receipt
            </button>
          )}
          {isOfficerOrAdmin && (
            <>
              <button
                onClick={onReview}
                disabled={updatingStatus}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
              >
                Accept for Review
              </button>
              <button
                onClick={onRejectReview}
                disabled={updatingStatus}
                className="px-3.5 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-medium transition"
              >
                Reject Application
              </button>
            </>
          )}
        </>
      )}

      {app.status === "PAYMENT_UPLOADED" && isOfficerOrAdmin && onOpenVerifyPayment && (
        <button
          onClick={onOpenVerifyPayment}
          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition flex items-center gap-1 shadow-xs"
        >
          🔍 Verify Payment Challan
        </button>
      )}

      {app.status === "CLARIFICATION_ASKED" && isApplicant && onOpenClarificationRespond && (
        <button
          onClick={onOpenClarificationRespond}
          className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition flex items-center gap-1 shadow-xs"
        >
          💬 Respond to Clarification
        </button>
      )}

      {app.status === "UNDER_REVIEW" && isOfficerOrAdmin && (
        <>
          <button
            onClick={onOpenSchedule}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition"
          >
            Schedule Inspection
          </button>
          <button
            onClick={onOpenAssign}
            className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition"
          >
            Assign Verifier
          </button>
          {onOpenClarificationRequest && (
            <button
              onClick={onOpenClarificationRequest}
              className="px-3.5 py-1.5 rounded-lg border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 text-xs font-medium transition"
            >
              ❓ Request Clarification
            </button>
          )}
          <button
            onClick={onRejectReview}
            className="px-3.5 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-medium transition"
          >
            Reject
          </button>
        </>
      )}

      {app.status === "SCHEDULED" && (
        <>
          {isAssignedVerifier && (
            <button
              onClick={onStartInspection}
              disabled={startingInspection}
              className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition"
            >
              Start Inspection
            </button>
          )}
          {isOfficerOrAdmin && (
            <>
              <button
                onClick={onOpenSchedule}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition"
              >
                Reschedule
              </button>
              <button
                onClick={onOpenAssign}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-medium transition"
              >
                Reassign
              </button>
            </>
          )}
        </>
      )}

      {app.status === "INSPECTION_IN_PROGRESS" && isAssignedVerifier && (
        <>
          <button
            onClick={onOpenAddObs}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
          >
            + Add Observation
          </button>
          <button
            onClick={onOpenResult}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
          >
            Finalize Result
          </button>
        </>
      )}

      {app.status === "VERIFIED" && isOfficerOrAdmin && (
        <button
          onClick={onOpenIssueCert}
          className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition shadow-xs flex items-center gap-1.5 animate-pulse"
        >
          📜 Issue Certificate
        </button>
      )}
    </div>
  );
};
