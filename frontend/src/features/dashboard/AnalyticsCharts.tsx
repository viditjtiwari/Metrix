"use client";

import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { useGetDashboardChartsQuery } from "./dashboardApi";
import { BarChart3, TrendingUp, PieChart as PieIcon } from "lucide-react";
import { UserRole } from "@/types";

interface Props {
  role?: UserRole;
}

const COLORS = ["#10b981", "#3b82f6", "#6366f1", "#f59e0b", "#ec4899", "#8b5cf6", "#06b6d4"];

export function AnalyticsCharts({ role }: Props) {
  const { data: chartData, isLoading } = useGetDashboardChartsQuery();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs text-center text-xs text-slate-400">
        Loading analytics visualizations...
      </div>
    );
  }

  const appStatus = chartData?.applications_by_status || [];
  const monthlyTrend = chartData?.monthly_trend || [];
  const certStatus = chartData?.certificates_by_status || [];
  const instTypes = chartData?.instruments_by_type || [];
  const usersByRole = chartData?.users_by_role || [];

  const pieData =
    role === "ADMIN" && usersByRole.length > 0
      ? usersByRole
      : certStatus.length > 0
      ? certStatus
      : instTypes;

  const pieTitle =
    role === "ADMIN" && usersByRole.length > 0
      ? "User Role Distribution"
      : certStatus.length > 0
      ? "Certificates by Status"
      : "Instruments by Category";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications by Status Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                <BarChart3 className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Applications by Status
                </h3>
                <p className="text-[11px] text-slate-400">
                  Real-time pipeline breakdown
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              Total Stages: {appStatus.length}
            </span>
          </div>

          <div className="h-64 w-full">
            {appStatus.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No application data available yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appStatus} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "11px",
                      border: "none",
                    }}
                  />
                  <Bar dataKey="value" name="Applications" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Distribution Pie Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <PieIcon className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                {pieTitle}
              </h3>
              <p className="text-[11px] text-slate-400">Proportional share</p>
            </div>
          </div>

          <div className="h-64 w-full flex flex-col items-center justify-center">
            {pieData.length === 0 ? (
              <div className="text-xs text-slate-400">No data available</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((_: unknown, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: "11px",
                        border: "none",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="mt-2 flex flex-wrap justify-center gap-2 max-h-16 overflow-y-auto w-full">
                  {pieData.map((item: { name: string; value: number }, idx: number) => (
                    <span
                      key={item.name}
                      className="inline-flex items-center gap-1.5 text-[10px] text-slate-600 font-medium bg-slate-50 px-2 py-0.5 rounded-full"
                    >
                      <span
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      {item.name}: {item.value}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Verification & Issuance Trends Line Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <TrendingUp className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Monthly Activity Trends (Last 6 Months)
              </h3>
              <p className="text-[11px] text-slate-400">
                Applications filed vs Certificates issued
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-blue-600 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" /> Applications
            </span>
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Certificates
            </span>
          </div>
        </div>

        <div className="h-56 w-full">
          {monthlyTrend.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No historical data available
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrend} margin={{ top: 10, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    borderRadius: "8px",
                    color: "#fff",
                    fontSize: "11px",
                    border: "none",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="applications"
                  name="Applications"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="certificates"
                  name="Certificates"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
