"use client";

import React from "react";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { useGetDashboardSummaryQuery } from "@/features/dashboard/dashboardApi";
import { MetricCard } from "@/components/ui/MetricCard";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { getRoleLabel } from "@/utils/formatters";
import { LifecycleStepper } from "@/features/dashboard/LifecycleStepper";
import { AnalyticsCharts } from "@/features/dashboard/AnalyticsCharts";
import { NoticeBoard } from "@/features/notices/NoticeBoard";
import {
  Scale, FileText, Award, AlertTriangle, ClipboardCheck,
  Users, RefreshCw, Plus, Search, Download,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { data, isLoading, isError, refetch } = useGetDashboardSummaryQuery();

  const metrics = data?.metrics || {};
  const role = user?.role;

  if (isLoading) return <LoadingSpinner text="Loading dashboard..." />;

  if (isError) {
    return (
      <div className="p-6 text-center text-sm text-red-600 bg-red-50 rounded-xl border border-red-200">
        Failed to load dashboard. Please check your connection.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        badge={
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
            {getRoleLabel(role || "")}
          </span>
        }
        actions={
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 text-xs font-medium hover:bg-slate-50 transition"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        }
      />

      {/* 6-Phase Lifecycle Flow & Quick Start Guide */}
      <LifecycleStepper role={role} />

      {/* Role Metrics */}
      {role === "INSTRUMENT_OWNER" && <OwnerDashboard metrics={metrics} />}
      {role === "LMO" && <LmoDashboard metrics={metrics} />}
      {role === "GATC" && <GatcDashboard metrics={metrics} />}
      {role === "ADMIN" && <AdminDashboard metrics={metrics} />}

      {/* Analytics Visualizations & Department Notice Board */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <AnalyticsCharts role={role} />
        </div>
        <div className="xl:col-span-1">
          <NoticeBoard />
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickLink href="/search" icon={<Search size={18} />} title="Advanced Search" desc="Search instruments, applications & certificates" />
        <QuickLink href="/reports" icon={<Download size={18} />} title="Export Reports" desc="Download operational CSV reports" />
        <QuickLink href="/notifications" icon={<AlertTriangle size={18} />} title="Notifications" desc="View alerts and expiry reminders" />
      </div>
    </div>
  );
}

function OwnerDashboard({ metrics }: { metrics: Record<string, any> }) {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="My Instruments" value={metrics.total_instruments ?? 0} icon={<Scale size={18} />} />
        <MetricCard label="Active Certificates" value={metrics.active_certificates ?? 0} variant="success" icon={<Award size={18} />} />
        <MetricCard label="Pending Applications" value={metrics.pending_applications ?? 0} icon={<FileText size={18} />} />
        <MetricCard label="Expiring Certificates" value={metrics.expired_certificates ?? 0} variant={Number(metrics.expired_certificates) > 0 ? "warning" : "default"} icon={<AlertTriangle size={18} />} />
      </div>
      <div className="flex gap-3">
        <Link href="/instruments" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition">
          <Plus size={16} /> Register Instrument
        </Link>
        <Link href="/applications" className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition">
          <FileText size={16} /> New Application
        </Link>
      </div>
    </>
  );
}

function LmoDashboard({ metrics }: { metrics: Record<string, any> }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard label="Pending Review" value={metrics.applications_pending_review ?? 0} variant="warning" icon={<FileText size={18} />} />
      <MetricCard label="Scheduled Inspections" value={metrics.scheduled_inspections ?? 0} icon={<ClipboardCheck size={18} />} />
      <MetricCard label="In Progress" value={metrics.inspections_in_progress ?? 0} icon={<ClipboardCheck size={18} />} />
      <MetricCard label="Certificates Issued" value={metrics.certificates_issued ?? 0} variant="success" icon={<Award size={18} />} />
      <MetricCard label="Verified" value={metrics.verified_applications ?? 0} variant="success" />
      <MetricCard label="Rejected" value={metrics.rejected_applications ?? 0} variant={Number(metrics.rejected_applications) > 0 ? "danger" : "default"} />
      <MetricCard label="Completed" value={metrics.completed_inspections ?? 0} />
      <MetricCard label="Expiring Certs" value={metrics.certificates_expiring ?? 0} variant={Number(metrics.certificates_expiring) > 0 ? "warning" : "default"} />
    </div>
  );
}

function GatcDashboard({ metrics }: { metrics: Record<string, any> }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard label="Assigned Inspections" value={metrics.assigned_inspections ?? 0} icon={<ClipboardCheck size={18} />} />
      <MetricCard label="Scheduled" value={metrics.scheduled_inspections ?? 0} />
      <MetricCard label="In Progress" value={metrics.inspections_in_progress ?? 0} variant="warning" />
      <MetricCard label="Completed" value={metrics.completed_inspections ?? 0} variant="success" />
    </div>
  );
}

function AdminDashboard({ metrics }: { metrics: Record<string, any> }) {
  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total Users" value={metrics.total_users ?? 0} icon={<Users size={18} />} />
        <MetricCard label="Total Instruments" value={metrics.total_instruments ?? 0} icon={<Scale size={18} />} />
        <MetricCard label="Total Applications" value={metrics.total_applications ?? 0} icon={<FileText size={18} />} />
        <MetricCard label="Active Certificates" value={metrics.active_certificates ?? 0} variant="success" icon={<Award size={18} />} />
        <MetricCard label="All Inspections" value={metrics.inspections ?? 0} icon={<ClipboardCheck size={18} />} />
        <MetricCard label="All Certificates" value={metrics.certificates ?? 0} />
        <MetricCard label="Expiring Soon" value={metrics.expiring_certificates ?? 0} variant={Number(metrics.expiring_certificates) > 0 ? "warning" : "default"} />
        <MetricCard label="Expired" value={metrics.expired_certificates ?? 0} variant={Number(metrics.expired_certificates) > 0 ? "danger" : "default"} />
      </div>
      {metrics.applications_by_status && (
        <div className="p-5 bg-white rounded-xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Applications by Status</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {Object.entries(metrics.applications_by_status as Record<string, number>).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                <span className="text-slate-600 font-medium">{status.replace(/_/g, " ")}</span>
                <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function QuickLink({ href, icon, title, desc }: { href: string; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Link href={href} className="p-4 bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition group">
      <div className="flex items-center gap-2 text-sm font-bold text-slate-900 group-hover:text-emerald-600 transition">
        {icon} {title}
      </div>
      <p className="mt-1 text-xs text-slate-500">{desc}</p>
    </Link>
  );
}
