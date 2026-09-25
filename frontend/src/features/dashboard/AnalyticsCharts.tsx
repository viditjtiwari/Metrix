"use client";

import React from "react";
import { useGetDashboardChartsQuery } from "./dashboardApi";
import { DynamicBarCard, DynamicDonutCard } from "./ChartCards";
import { TrendLineCard } from "./TrendLineCard";
import { UserRole } from "@/types";
import {
  BarChart3, PieChart as PieIcon, ShieldCheck, CheckCircle2,
  Scale, ClipboardCheck, Users, Calendar
} from "lucide-react";

interface Props {
  role?: UserRole;
}

export function AnalyticsCharts({ role }: Props) {
  const { data: chartData, isLoading } = useGetDashboardChartsQuery();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs text-center text-xs text-slate-400">
        Loading real-time analytics data...
      </div>
    );
  }

  const appStatus = chartData?.applications_by_status || [];
  const monthlyTrend = chartData?.monthly_trend || [];
  const certHealth = chartData?.certificate_health || [];
  const instTypes = chartData?.instruments_by_type || [];
  const outcomes = chartData?.verification_outcomes || [];
  const modes = chartData?.inspection_modes || [];
  const usersByRole = chartData?.users_by_role || [];
  const stampingQuarters = chartData?.stamping_quarters || [];

  return (
    <div className="space-y-6">
      {/* ─── INSTRUMENT OWNER ANALYTICS ─── */}
      {role === "INSTRUMENT_OWNER" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DynamicBarCard
                title="My Verification Applications by Status"
                subtitle="Live status of verification & re-verification requests"
                icon={<BarChart3 className="h-4 w-4 text-emerald-600" />}
                data={appStatus}
                barColor="#10b981"
                barName="Applications"
              />
            </div>
            <div>
              <DynamicDonutCard
                title="Certificate Health & Expiry Timeline"
                subtitle="Real-time compliance monitoring"
                icon={<ShieldCheck className="h-4 w-4 text-emerald-600" />}
                data={certHealth}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TrendLineCard
                data={monthlyTrend}
                title="My Monthly Verification Activity"
                subtitle="Applications submitted vs Certificates received (Last 6 Months)"
              />
            </div>
            <div>
              <DynamicDonutCard
                title="My Registered Instruments"
                subtitle="Equipment category distribution"
                icon={<Scale className="h-4 w-4 text-blue-600" />}
                data={instTypes}
              />
            </div>
          </div>
        </>
      )}

      {/* ─── LMO (LEGAL METROLOGY OFFICER) ANALYTICS ─── */}
      {role === "LMO" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DynamicBarCard
                title="Operational Scrutiny & Inspection Pipeline"
                subtitle="Real-time workflow distribution across operational stages"
                icon={<BarChart3 className="h-4 w-4 text-blue-600" />}
                data={appStatus}
                barColor="#3b82f6"
                barName="Applications"
              />
            </div>
            <div>
              <DynamicDonutCard
                title="Field Verification Outcomes"
                subtitle="Tolerance MPE pass vs rejection ratio"
                icon={<CheckCircle2 className="h-4 w-4 text-blue-600" />}
                data={outcomes}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TrendLineCard
                data={monthlyTrend}
                title="Monthly Verification Throughput"
                subtitle="Processed applications vs Certificates issued"
              />
            </div>
            <div>
              <DynamicDonutCard
                title="Inspection Mode Breakdown"
                subtitle="LMO Field Verification vs GATC Lab Testing"
                icon={<ClipboardCheck className="h-4 w-4 text-violet-600" />}
                data={modes}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DynamicBarCard
                title="Verified Instruments by Statutory Type"
                subtitle="Classification of verified equipment across jurisdiction"
                icon={<Scale className="h-4 w-4 text-indigo-600" />}
                data={instTypes}
                barColor="#6366f1"
                barName="Instruments"
              />
            </div>
            <div>
              <DynamicDonutCard
                title="Statutory Stamping Quarters"
                subtitle="Quarterly verification seals (Q1-Q4)"
                icon={<Calendar className="h-4 w-4 text-amber-600" />}
                data={stampingQuarters}
              />
            </div>
          </div>
        </>
      )}

      {/* ─── GATC (TEST CENTRE) ANALYTICS ─── */}
      {role === "GATC" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DynamicBarCard
                title="Laboratory Testing Queue & Progress"
                subtitle="High-capacity & specialized calibration queue"
                icon={<BarChart3 className="h-4 w-4 text-violet-600" />}
                data={appStatus}
                barColor="#8b5cf6"
                barName="Tests"
              />
            </div>
            <div>
              <DynamicDonutCard
                title="Calibration Results"
                subtitle="Verified vs Out-of-Tolerance tests"
                icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                data={outcomes}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TrendLineCard
                data={monthlyTrend}
                title="Monthly Laboratory Calibration Volume"
                subtitle="Specialized tests completed over last 6 months"
              />
            </div>
            <div>
              <DynamicDonutCard
                title="Specialized Instruments Calibrated"
                subtitle="Weighbridges, Storage tanks, Flow meters"
                icon={<Scale className="h-4 w-4 text-purple-600" />}
                data={instTypes}
              />
            </div>
          </div>
        </>
      )}

      {/* ─── ADMIN (NATIONAL CONTROLLER) ANALYTICS ─── */}
      {role === "ADMIN" && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DynamicBarCard
                title="National Application Pipeline by Status"
                subtitle="Real-time status of all verification requests nationwide"
                icon={<BarChart3 className="h-4 w-4 text-amber-600" />}
                data={appStatus}
                barColor="#f59e0b"
                barName="Applications"
              />
            </div>
            <div>
              <DynamicDonutCard
                title="National Compliance & Expiry Overview"
                subtitle="Active vs Expiring vs Overdue instruments"
                icon={<ShieldCheck className="h-4 w-4 text-emerald-600" />}
                data={certHealth}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <TrendLineCard
                data={monthlyTrend}
                title="Nationwide Verification & Certification Volume"
                subtitle="Total applications filed vs Digital certificates issued"
              />
            </div>
            <div>
              <DynamicDonutCard
                title="Portal User Distribution"
                subtitle="Registered stakeholders by RBAC role"
                icon={<Users className="h-4 w-4 text-blue-600" />}
                data={usersByRole}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <DynamicBarCard
                title="National Registry by Measuring Category"
                subtitle="Distribution of all registered weighing & measuring instruments"
                icon={<Scale className="h-4 w-4 text-indigo-600" />}
                data={instTypes}
                barColor="#6366f1"
                barName="Instruments"
              />
            </div>
            <div>
              <DynamicDonutCard
                title="Field vs Lab Inspections"
                subtitle="LMO Field Verification vs GATC Lab Testing"
                icon={<ClipboardCheck className="h-4 w-4 text-purple-600" />}
                data={modes}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
