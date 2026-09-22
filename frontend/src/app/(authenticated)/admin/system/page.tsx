"use client";

import React from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import { useGetDashboardSummaryQuery } from "@/features/dashboard/dashboardApi";
import { useCheckExpiriesMutation } from "@/features/notifications/notificationApi";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { MetricCard } from "@/components/ui/MetricCard";
import { Users, Scale, FileText, Award, Bell, Server } from "lucide-react";

export default function AdminSystemPage() {
  const { data, isLoading } = useGetDashboardSummaryQuery();
  const [checkExpiries, { isLoading: checking }] = useCheckExpiriesMutation();

  const metrics = data?.metrics || {};

  const handleCheckExpiries = async () => {
    try {
      await checkExpiries().unwrap();
      alert("Expiry check completed. Notifications have been sent.");
    } catch {
      alert("Failed to run expiry check.");
    }
  };

  return (
    <AuthGuard requiredRoles={["ADMIN"]}>
      <div className="space-y-6">
        <PageHeader
          title="System Administration"
          description="System-wide metrics and administrative actions"
          badge={<Server size={18} className="text-slate-400" />}
        />

        {isLoading ? <LoadingSpinner /> : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="Total Users" value={metrics.total_users ?? "—"} icon={<Users size={18} />} />
            <MetricCard label="Total Instruments" value={metrics.total_instruments ?? "—"} icon={<Scale size={18} />} />
            <MetricCard label="Total Applications" value={metrics.total_applications ?? "—"} icon={<FileText size={18} />} />
            <MetricCard label="Total Certificates" value={metrics.certificates ?? "—"} icon={<Award size={18} />} />
          </div>
        )}

        {/* Admin Actions */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4">Administrative Actions</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
              <div>
                <div className="text-sm font-semibold text-slate-800">Check Certificate Expiries</div>
                <div className="text-xs text-slate-500">Scan for expiring/expired certificates and generate notifications</div>
              </div>
              <button
                onClick={handleCheckExpiries}
                disabled={checking}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition disabled:opacity-50"
              >
                <Bell size={16} /> {checking ? "Running..." : "Run Check"}
              </button>
            </div>
          </div>
        </div>

        {/* Audit Log Placeholder */}
        <div className="bg-slate-50 rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <Server size={24} className="mx-auto text-slate-400 mb-3" />
          <p className="text-sm font-semibold text-slate-600">System Audit Log</p>
          <p className="text-xs text-slate-400 mt-1">Detailed audit trail will be available once the backend API is implemented.</p>
        </div>
      </div>
    </AuthGuard>
  );
}
