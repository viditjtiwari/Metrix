"use client";

import React from "react";
import { formatStatusLabel, getStatusColor } from "@/utils/formatters";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const colorClass = getStatusColor(status);
  const sizeClass = size === "sm"
    ? "px-2 py-0.5 text-[11px]"
    : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border ${colorClass} ${sizeClass}`}
    >
      {formatStatusLabel(status)}
    </span>
  );
}
