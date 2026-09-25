"use client";

import React from "react";
import { useAppSelector } from "@/store/hooks";
import { PageHeader } from "@/components/ui/PageHeader";
import { AnalyticsCharts } from "@/features/dashboard/AnalyticsCharts";
import { getRoleLabel } from "@/utils/formatters";
import { BarChart3, Download, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const role = user?.role;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operational Analytics & Trends"
        description="Comprehensive metrological verification trends, status distributions, and instrument statistics"
        badge={
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
            <BarChart3 size={14} />
            <span>{getRoleLabel(role || "")} Analytics</span>
          </div>
        }
        actions={
          <Link
            href="/reports"
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition shadow-2xs"
          >
            <Download size={14} /> Export CSV Reports
          </Link>
        }
      />

      {/* Segregated Analytics Visualizations */}
      <AnalyticsCharts role={role} />
    </div>
  );
}
