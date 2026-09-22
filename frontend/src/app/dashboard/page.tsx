"use client";

import React, { useState, useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { useGetDashboardSummaryQuery } from "@/features/dashboard/dashboardApi";
import {
  RoleSwitcher,
  DashboardRole,
} from "@/components/dashboard/RoleSwitcher";
import { LmoDashboardView } from "@/components/dashboard/LmoDashboardView";
import { OwnerDashboardView } from "@/components/dashboard/OwnerDashboardView";
import { GatcDashboardView } from "@/components/dashboard/GatcDashboardView";
import { AdminDashboardView } from "@/components/dashboard/AdminDashboardView";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Button";

function mapRoleToDashboard(role?: string): DashboardRole {
  switch (role) {
    case "ADMIN":
      return "admin";
    case "GATC":
      return "gatc";
    case "INSTRUMENT_OWNER":
      return "owner";
    default:
      return "lmo";
  }
}

export default function DashboardPage() {
  const { user } = useAppSelector((state) => state.auth);
  const { data, isLoading, refetch } = useGetDashboardSummaryQuery();

  const [activeRole, setActiveRole] = useState<DashboardRole>("lmo");

  // Sync default role when user loads
  useEffect(() => {
    if (user?.role) {
      setActiveRole(mapRoleToDashboard(user.role));
    }
  }, [user?.role]);

  const metrics = (data?.metrics as Record<string, number>) || {};

  return (
    <AuthGuard>
      <div className="space-y-6 animate-fade-in">
        {/* Top Workspace Header & Interactive Role Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-secondary text-xs uppercase font-semibold tracking-wider">
              <span className="material-symbols-outlined text-base">
                verified_user
              </span>
              <span>National Metrological Surveillance Network</span>
            </div>
            <h1 className="font-headline font-bold text-2xl text-on-surface tracking-tight mt-0.5">
              Executive Operations Cockpit
            </h1>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <RoleSwitcher
              currentRole={activeRole}
              onChangeRole={setActiveRole}
            />
            <Button
              variant="outline"
              size="sm"
              icon="refresh"
              onClick={() => refetch()}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Loading state */}
        {isLoading ? (
          <div className="py-20">
            <LoadingSpinner size="lg" label="Loading dashboard metrics..." />
          </div>
        ) : (
          <>
            {activeRole === "lmo" && <LmoDashboardView metrics={metrics} />}
            {activeRole === "owner" && (
              <OwnerDashboardView metrics={metrics} />
            )}
            {activeRole === "gatc" && <GatcDashboardView metrics={metrics} />}
            {activeRole === "admin" && (
              <AdminDashboardView metrics={metrics} />
            )}
          </>
        )}
      </div>
    </AuthGuard>
  );
}
