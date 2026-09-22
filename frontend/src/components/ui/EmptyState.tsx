"use client";

import React from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-14 h-14 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-2xl text-outline">
          {icon}
        </span>
      </div>
      <h3 className="text-sm font-semibold text-on-surface">{title}</h3>
      {description && (
        <p className="mt-1 text-xs text-on-surface-variant max-w-sm">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
