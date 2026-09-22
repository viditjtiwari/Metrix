"use client";

import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

const sizeMap = {
  sm: "h-3.5 w-3.5 border-[1.5px]",
  md: "h-5 w-5 border-2",
  lg: "h-8 w-8 border-[2.5px]",
};

export function LoadingSpinner({ size = "md", label }: LoadingSpinnerProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      <div
        className={`${sizeMap[size]} rounded-full border-surface-variant border-t-secondary animate-spin`}
      />
      {label && (
        <span className="text-xs text-on-surface-variant">{label}</span>
      )}
    </div>
  );
}
