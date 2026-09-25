"use client";

import React from "react";
import { ApplicationStatus } from "@/types";

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
  size?: "sm" | "md";
}

const statusConfig: Record<
  ApplicationStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  DRAFT: {
    label: "Draft",
    bg: "bg-slate-100",
    text: "text-slate-700",
    dot: "bg-slate-400",
  },
  SUBMITTED: {
    label: "Submitted",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  PAYMENT_UPLOADED: {
    label: "Challan Uploaded",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
  },
  PAYMENT_VERIFIED: {
    label: "Payment Verified",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  CLARIFICATION_ASKED: {
    label: "Clarification Needed",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  SCHEDULED: {
    label: "Scheduled",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
  },
  INSPECTION_IN_PROGRESS: {
    label: "Inspection In Progress",
    bg: "bg-purple-50",
    text: "text-purple-700",
    dot: "bg-purple-500",
  },
  INSPECTION_COMPLETED: {
    label: "Inspection Completed",
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    dot: "bg-cyan-500",
  },
  VERIFIED: {
    label: "Verified",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  CERTIFICATE_ISSUED: {
    label: "Certificate Issued",
    bg: "bg-teal-50",
    text: "text-teal-700",
    dot: "bg-teal-500",
  },
  REJECTED: {
    label: "Rejected",
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
  },
};

export function ApplicationStatusBadge({
  status,
  size = "sm",
}: ApplicationStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    bg: "bg-slate-100",
    text: "text-slate-700",
    dot: "bg-slate-400",
  };

  const padClasses =
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm font-semibold";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-current/10 font-medium ${config.bg} ${config.text} ${padClasses}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
