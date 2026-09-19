"use client";

import React from "react";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { useGetDashboardSummaryQuery } from "@/features/dashboard/dashboardApi";

export default function DashboardPage() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const { data, isLoading, isError, refetch } = useGetDashboardSummaryQuery();

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-xs">
        <h2 className="text-base font-semibold text-slate-900">Sign In Required</h2>
        <p className="mt-1 text-xs text-slate-500">
          Please sign in to view your operational metrics dashboard.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  const metrics = data?.metrics || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Operations Dashboard
            </h1>
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
              {data?.role || user?.role}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Real-time operational summary, verification telemetry, and expiry metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs hover:bg-slate-50 transition"
          >
            Refresh
          </button>
          <Link
            href="/search"
            className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            Quick Search
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
          <div className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-emerald-600 animate-spin mr-2" />
          Loading dashboard metrics...
        </div>
      ) : isError ? (
        <div className="p-6 text-center text-xs text-rose-600 bg-rose-50 rounded-xl border border-rose-200">
          Failed to load dashboard metrics. Please check your network connection and session.
        </div>
      ) : (
        <>
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(metrics)
              .filter(([key]) => key !== "applications_by_status")
              .map(([key, value]) => {
                const label = key
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ");

                const isWarning =
                  key.includes("expired") || key.includes("expiring") || key.includes("rejected");

                return (
                  <div
                    key={key}
                    className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between"
                  >
                    <span className="text-xs font-medium text-slate-500">{label}</span>
                    <span
                      className={`text-2xl font-bold mt-2 ${
                        isWarning && Number(value) > 0 ? "text-amber-600" : "text-slate-900"
                      }`}
                    >
                      {String(value)}
                    </span>
                  </div>
                );
              })}
          </div>

          {/* Breakdown by Status (if present) */}
          {metrics.applications_by_status && (
            <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Applications by Status</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Object.entries(metrics.applications_by_status as Record<string, number>).map(
                  ([statusKey, count]) => (
                    <div
                      key={statusKey}
                      className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-slate-700">{statusKey}</span>
                      <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {count}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {/* Quick Navigation Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/search"
              className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition group"
            >
              <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-600">
                Advanced Search &rarr;
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Search instruments, verification applications, and issued certificates.
              </p>
            </Link>
            <Link
              href="/reports"
              className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition group"
            >
              <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-600">
                Export Reports &rarr;
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Download operational verification, instrument, and expiry CSV records.
              </p>
            </Link>
            <Link
              href="/notifications"
              className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition group"
            >
              <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-600">
                Notifications Center &rarr;
              </div>
              <p className="mt-1 text-xs text-slate-500">
                View workflow notifications, inspection updates, and expiry reminders.
              </p>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
