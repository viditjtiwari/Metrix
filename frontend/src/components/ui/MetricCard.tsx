"use client";

import React from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "warning" | "danger" | "success";
}

const VARIANT_STYLES = {
  default: "border-slate-200 bg-white",
  warning: "border-amber-200 bg-amber-50/50",
  danger: "border-red-200 bg-red-50/50",
  success: "border-emerald-200 bg-emerald-50/50",
};

const VALUE_STYLES = {
  default: "text-slate-900",
  warning: "text-amber-700",
  danger: "text-red-700",
  success: "text-emerald-700",
};

export function MetricCard({ label, value, icon, variant = "default" }: MetricCardProps) {
  return (
    <div className={`rounded-xl border p-5 transition hover:shadow-sm ${VARIANT_STYLES[variant]}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
      <div className={`mt-2 text-2xl font-bold tracking-tight ${VALUE_STYLES[variant]}`}>
        {value}
      </div>
    </div>
  );
}
