"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useGetDashboardSummaryQuery } from "@/features/dashboard/dashboardApi";
import { useGetApplicationsQuery } from "@/features/applications/applicationApi";
import { DashboardMetrics } from "@/features/dashboard/DashboardMetrics";
import { QuickNavPanel } from "@/features/dashboard/QuickNavPanel";
import { LifecycleStepper } from "@/features/dashboard/LifecycleStepper";
import { AnalyticsCharts } from "@/features/dashboard/AnalyticsCharts";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { getRoleLabel, formatDate } from "@/utils/formatters";
import {
  FileText, ClipboardCheck, Users, RefreshCw, Plus,
  ArrowRight, BarChart3, BookOpen, LayoutDashboard, Megaphone
} from "lucide-react";

type DashboardTab = "overview" | "analytics" | "workflow";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  const { data: summaryData, isLoading: isSummaryLoading, isError, refetch } =
    useGetDashboardSummaryQuery();
  const { data: appsData, isLoading: isAppsLoading } = useGetApplicationsQuery({
    page: 1,
    page_size: 5,
  });

  const metrics = summaryData?.metrics || {};
  const role = user?.role;
  const recentApps = appsData?.items || [];

  if (isSummaryLoading) return <LoadingSpinner text="Loading dashboard..." />;

  if (isError) {
    return (
      <div className="p-6 text-center text-xs text-rose-600 bg-rose-50 rounded-xl border border-rose-200">
        Failed to load dashboard data. Please verify network connectivity.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Welcome & Context Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {getRoleLabel(role || "")}
            </span>
            <span className="text-[11px] text-slate-400">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "short", day: "numeric" })}
            </span>
          </div>
          <h1 className="text-lg font-bold text-slate-900 mt-1">
            Welcome back, {user?.full_name || "Official"}
          </h1>
          <p className="text-xs text-slate-500">
            Legal Metrology Online Verification & Digital Certification System
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition"
            title="Refresh statistics"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>

          {role === "INSTRUMENT_OWNER" && (
            <Link
              href="/applications"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Plus size={14} /> New Application
            </Link>
          )}

          {role === "LMO" && (
            <Link
              href="/applications"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <ClipboardCheck size={14} /> Review Queue
            </Link>
          )}

          {role === "GATC" && (
            <Link
              href="/inspections"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <ClipboardCheck size={14} /> Test Queue
            </Link>
          )}

          {role === "ADMIN" && (
            <Link
              href="/admin/users"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Users size={14} /> Manage Officers
            </Link>
          )}
        </div>
      </div>

      {/* Segregated Sub-Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "overview"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <LayoutDashboard size={14} />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "analytics"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <BarChart3 size={14} />
            <span>Analytics & Trends</span>
          </button>

          <button
            onClick={() => setActiveTab("workflow")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === "workflow"
                ? "bg-slate-900 text-white shadow-2xs"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <BookOpen size={14} />
            <span>Process Guide</span>
          </button>
        </div>

        <Link
          href="/notices"
          className="hidden sm:flex items-center gap-1.5 text-xs text-blue-700 font-semibold hover:text-blue-900 transition"
        >
          <Megaphone size={13} />
          <span>Department Notices</span>
          <ArrowRight size={12} />
        </Link>
      </div>

      {/* Tab 1: Operational Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Key Operational Metric Cards */}
          <DashboardMetrics role={role} metrics={metrics} />

          {/* Operational Two-Column Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Recent Applications Queue */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-500" />
                    <h2 className="text-sm font-bold text-slate-900">Recent Applications</h2>
                  </div>
                  <Link
                    href="/applications"
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1 transition"
                  >
                    <span>View all</span>
                    <ArrowRight size={12} />
                  </Link>
                </div>

                <div className="mt-3 divide-y divide-slate-100">
                  {isAppsLoading ? (
                    <div className="py-8 text-center text-xs text-slate-400">Loading recent applications...</div>
                  ) : recentApps.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No verification applications submitted yet.
                    </div>
                  ) : (
                    recentApps.map((app) => (
                      <div
                        key={app.id}
                        onClick={() => router.push(`/applications/${app.id}`)}
                        className="py-2.5 px-2 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-lg cursor-pointer transition"
                      >
                        <div className="min-w-0">
                          <div className="font-mono text-xs font-semibold text-slate-900">
                            {app.application_number}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            Submitted {formatDate(app.submitted_at || app.created_at)}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <StatusBadge status={app.status} />
                          <ArrowRight size={14} className="text-slate-300" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Quick Help */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Click any application to inspect verification details</span>
                <Link href="/search" className="text-slate-600 hover:text-slate-900 font-medium">
                  Search Registry →
                </Link>
              </div>
            </div>

            {/* Right Column: Quick Access & Portal Tools */}
            <QuickNavPanel />
          </div>
        </div>
      )}

      {/* Tab 2: Segregated Analytics & Trends */}
      {activeTab === "analytics" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Metrological Trends & Distributions</h2>
              <p className="text-xs text-slate-500">Visual breakdowns of application stages, monthly volumes, and instrument classifications</p>
            </div>
            <Link
              href="/reports"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 transition flex items-center gap-1"
            >
              Export CSV Data →
            </Link>
          </div>
          <AnalyticsCharts role={role} />
        </div>
      )}

      {/* Tab 3: Segregated Lifecycle Stepper & Guidelines */}
      {activeTab === "workflow" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">Legal Metrology Verification Lifecycle</h2>
            <p className="text-xs text-slate-500">Official statutory flow prescribed under the Legal Metrology Act, 2009 and GATC Rules, 2013</p>
          </div>
          <LifecycleStepper role={role} />
        </div>
      )}
    </div>
  );
}
