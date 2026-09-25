"use client";

import React from "react";
import { UserRole } from "@/types";
import { MetricCard } from "@/components/ui/MetricCard";
import { Scale, FileText, Award, AlertTriangle, ClipboardCheck, Users } from "lucide-react";

interface Props {
  role?: UserRole;
  metrics: Record<string, any>;
}

export const DashboardMetrics: React.FC<Props> = ({ role, metrics }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {role === "INSTRUMENT_OWNER" && (
        <>
          <MetricCard label="Registered Instruments" value={metrics.total_instruments ?? 0} icon={<Scale size={18} />} />
          <MetricCard label="Active Certificates" value={metrics.active_certificates ?? 0} variant="success" icon={<Award size={18} />} />
          <MetricCard label="Applications In Progress" value={metrics.pending_applications ?? 0} icon={<FileText size={18} />} />
          <MetricCard label="Expiring (30 Days)" value={metrics.expired_certificates ?? 0} variant={Number(metrics.expired_certificates) > 0 ? "warning" : "default"} icon={<AlertTriangle size={18} />} />
        </>
      )}

      {role === "LMO" && (
        <>
          <MetricCard label="Pending Scrutiny" value={metrics.applications_pending_review ?? 0} variant="warning" icon={<FileText size={18} />} />
          <MetricCard label="Scheduled Inspections" value={metrics.scheduled_inspections ?? 0} icon={<ClipboardCheck size={18} />} />
          <MetricCard label="Verifications Passed" value={metrics.verified_applications ?? 0} variant="success" icon={<Award size={18} />} />
          <MetricCard label="Certificates Issued" value={metrics.certificates_issued ?? 0} variant="success" icon={<Scale size={18} />} />
        </>
      )}

      {role === "GATC" && (
        <>
          <MetricCard label="Assigned Lab Tests" value={metrics.assigned_inspections ?? 0} icon={<ClipboardCheck size={18} />} />
          <MetricCard label="Scheduled Tests" value={metrics.scheduled_inspections ?? 0} icon={<FileText size={18} />} />
          <MetricCard label="Testing In Progress" value={metrics.inspections_in_progress ?? 0} variant="warning" icon={<Scale size={18} />} />
          <MetricCard label="Completed Verifications" value={metrics.completed_inspections ?? 0} variant="success" icon={<Award size={18} />} />
        </>
      )}

      {role === "ADMIN" && (
        <>
          <MetricCard label="Registered Users" value={metrics.total_users ?? 0} icon={<Users size={18} />} />
          <MetricCard label="Total Instruments" value={metrics.total_instruments ?? 0} icon={<Scale size={18} />} />
          <MetricCard label="Total Applications" value={metrics.total_applications ?? 0} icon={<FileText size={18} />} />
          <MetricCard label="Active Certificates" value={metrics.active_certificates ?? 0} variant="success" icon={<Award size={18} />} />
        </>
      )}
    </div>
  );
};
