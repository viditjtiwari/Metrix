"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useGetApplicationsQuery } from "@/features/applications/applicationApi";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/utils/formatters";
import { ApplicationResponse, ApplicationStatus } from "@/types";
import { Calendar, Filter } from "lucide-react";

type InspectionTab = "all" | "SCHEDULED" | "UNDER_REVIEW" | "VERIFIED" | "REJECTED";

export default function InspectionsPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState<InspectionTab>("all");
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");

  const statusFilter: ApplicationStatus | undefined =
    activeTab === "all" ? undefined : activeTab;

  const { data, isLoading } = useGetApplicationsQuery({
    page,
    page_size: 20,
    status: statusFilter,
    application_number: searchText || undefined,
  });

  const columns = [
    {
      key: "application_number",
      label: "Application",
      render: (row: ApplicationResponse) => (
        <span className="font-mono font-semibold text-slate-900">{row.application_number}</span>
      ),
    },
    {
      key: "application_type",
      label: "Type",
      render: (row: ApplicationResponse) => (
        <span className="capitalize text-slate-700">{row.application_type.replace(/_/g, " ").toLowerCase()}</span>
      ),
    },
    {
      key: "instrument_id",
      label: "Instrument ID",
      render: (row: ApplicationResponse) => (
        <span className="font-mono text-slate-600">#{row.instrument_id}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: ApplicationResponse) => <StatusBadge status={row.status} />,
    },
    {
      key: "created_at",
      label: "Submitted",
      render: (row: ApplicationResponse) => (
        <span className="text-slate-500">{formatDate(row.submitted_at || row.created_at)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inspections & Verification Queue"
        description="Review inspection assignments, schedule tests, and record verification outcomes."
      />

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {(
          [
            { id: "all", label: "All Records" },
            { id: "SCHEDULED", label: "Scheduled" },
            { id: "UNDER_REVIEW", label: "Under Review" },
            { id: "VERIFIED", label: "Verified" },
            { id: "REJECTED", label: "Rejected" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setPage(1);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === tab.id
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div className="flex gap-3">
        <div className="flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search by application number..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPage(1);
            }}
            className="w-full h-9 rounded-lg border border-slate-200 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Data Table */}
      <DataTable<ApplicationResponse>
        columns={columns}
        data={data?.items || []}
        keyField="id"
        loading={isLoading}
        emptyTitle="No inspections found"
        emptyDescription="No inspection applications found matching the selected criteria."
        page={page}
        pageSize={20}
        total={data?.total || 0}
        onPageChange={setPage}
        onRowClick={(row) => router.push(`/applications/${row.id}`)}
      />
    </div>
  );
}
