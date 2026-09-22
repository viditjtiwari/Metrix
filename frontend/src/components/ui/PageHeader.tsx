"use client";

import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
}

export function PageHeader({ title, description, actions, badge }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">{title}</h1>
          {badge}
        </div>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
