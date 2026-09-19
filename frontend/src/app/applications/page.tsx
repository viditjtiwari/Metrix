"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useGetApplicationsQuery } from "@/features/applications/applicationApi";
import { ApplicationStatusBadge } from "@/features/applications/ApplicationStatusBadge";
import { useAppSelector } from "@/store/hooks";
import { ApplicationStatus } from "@/types";

const statusFilters: { label: string; value?: ApplicationStatus }[] = [
  { label: "All" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "In Progress", value: "INSPECTION_IN_PROGRESS" },
  { label: "Verified", value: "VERIFIED" },
  { label: "Rejected", value: "REJECTED" },
];

export default function ApplicationsListPage() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | undefined>();

  const { data, isLoading, isError, refetch } = useGetApplicationsQuery({
    status: selectedStatus,
    page: 1,
    pageSize: 50,
  });

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-xs">
        <h2 className="text-base font-semibold text-slate-900">Sign In Required</h2>
        <p className="mt-1 text-xs text-slate-500">
          Please sign in to view and manage verification applications.
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Verification Applications
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            {user?.role === "INSTRUMENT_OWNER"
              ? "Track your submitted legal metrology verification applications."
              : "Review, schedule, and execute operational verifications."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Active Role:</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-xs font-semibold">
            {user?.role}
          </span>
          <button
            onClick={() => refetch()}
            className="ml-2 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 text-xs hover:bg-slate-50 transition"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {statusFilters.map((tab) => {
          const isActive = selectedStatus === tab.value;
          return (
            <button
              key={tab.label}
              onClick={() => setSelectedStatus(tab.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Applications Table / Cards */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-xs text-slate-500">
            <div className="h-4 w-4 rounded-full border-2 border-slate-300 border-t-emerald-600 animate-spin mr-2" />
            Loading verification applications...
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-rose-600">
            Failed to load applications. Please try refreshing.
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No applications found matching the selected criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-medium">
                  <th className="py-3 px-4">Application #</th>
                  <th className="py-3 px-4">Instrument ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted At</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {data.items.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {app.application_number}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      INST-#{app.instrument_id}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {app.application_type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <ApplicationStatusBadge status={app.status} />
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {app.submitted_at
                        ? new Date(app.submitted_at).toLocaleDateString()
                        : "Draft"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/applications/${app.id}`}
                        className="inline-flex items-center font-semibold text-emerald-600 hover:text-emerald-700 transition"
                      >
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
