"use client";

import React from "react";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { PageHeader } from "@/components/ui/PageHeader";
import { useGetDashboardSummaryQuery } from "@/features/dashboard/dashboardApi";
import { useCheckExpiriesMutation } from "@/features/notifications/notificationApi";
import { useGetSystemHealthQuery } from "@/features/admin/adminApi";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { MetricCard } from "@/components/ui/MetricCard";
import { Users, Scale, FileText, Award, Bell, Server, Activity, Database, ShieldCheck } from "lucide-react";

export default function AdminSystemPage() {
  const { data, isLoading } = useGetDashboardSummaryQuery();
  const { data: healthData, isLoading: healthLoading } = useGetSystemHealthQuery();
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
          description="System-wide metrics, services health monitoring, and administrative actions"
          badge={<Server size={18} className="text-slate-400" />}
        />

        {/* Live Services & Connectivity Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">Services & Connectivity Status</h3>
            </div>
            {healthLoading ? (
              <span className="text-xs text-slate-400">Pinging services...</span>
            ) : healthData ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                All Systems Operational
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                Connectivity Degraded
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <Server size={14} className="text-slate-400" />
                <span>API Gateway</span>
              </div>
              <div className="text-sm font-bold text-slate-900 capitalize">
                {healthData?.status || "Unknown"}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                FastAPI v{healthData?.version || "1.0.0"} ({healthData?.environment || "development"})
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <Database size={14} className="text-slate-400" />
                <span>PostgreSQL Database</span>
              </div>
              <div className="text-sm font-bold text-slate-900 capitalize">
                {healthData?.database || "Unknown"}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                SQLAlchemy 2.x Session Pool
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
                <ShieldCheck size={14} className="text-slate-400" />
                <span>Security Engine</span>
              </div>
              <div className="text-sm font-bold text-slate-900">
                RBAC & JWT Active
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Statutory audit trail enabled
              </div>
            </div>
          </div>
        </div>

        {isLoading ? <LoadingSpinner /> : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard label="Total Users" value={metrics.total_users ?? "—"} icon={<Users size={18} />} />
              <MetricCard label="Total Instruments" value={metrics.total_instruments ?? "—"} icon={<Scale size={18} />} />
              <MetricCard label="Total Applications" value={metrics.total_applications ?? "—"} icon={<FileText size={18} />} />
              <MetricCard label="Total Certificates" value={metrics.certificates ?? "—"} icon={<Award size={18} />} />
            </div>

            {/* Tenancy Distributions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Users by Role */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Stakeholders by Role
                </h4>
                <div className="space-y-2 text-xs">
                  {metrics.users_by_role && Object.entries(metrics.users_by_role).map(([r, count]) => (
                    <div key={r} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                      <span className="font-medium text-slate-700 capitalize">{r.replace(/_/g, " ").toLowerCase()}</span>
                      <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full">{Number(count)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Applications by Status */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Applications by Status
                </h4>
                <div className="space-y-2 text-xs">
                  {metrics.applications_by_status && Object.entries(metrics.applications_by_status).slice(0, 5).map(([st, count]) => (
                    <div key={st} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                      <span className="font-medium text-slate-700 capitalize">{st.replace(/_/g, " ").toLowerCase()}</span>
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">{Number(count)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certificate Validity Health */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Certificate Health
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="font-medium text-slate-700">Active Valid</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{metrics.active_certificates ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-slate-100">
                    <span className="font-medium text-slate-700">Expiring Soon (30d)</span>
                    <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">{metrics.expiring_certificates ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="font-medium text-slate-700">Expired</span>
                    <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">{metrics.expired_certificates ?? 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
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
