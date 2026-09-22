"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useListApplicationsQuery } from "@/features/applications/applicationApi";
import { CreateApplicationModal } from "@/features/applications/CreateApplicationModal";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/utils/formatters";
import { ApplicationResponse, ApplicationStatus } from "@/types";
import { Plus, FileText } from "lucide-react";

export default function ApplicationsPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchText, setSearchText] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useListApplicationsQuery({
    page,
    page_size: 20,
    status: (statusFilter as ApplicationStatus) || undefined,
    application_number: searchText || undefined,
  });

  const canCreate = user?.role === "INSTRUMENT_OWNER" || user?.role === "ADMIN";

  const columns = [
    {
      key: "application_number",
      label: "App Number",
      render: (row: ApplicationResponse) => (
        <span className="font-mono text-xs font-semibold text-slate-900">{row.application_number}</span>
      ),
    },
    {
      key: "application_type",
      label: "Type",
      render: (row: ApplicationResponse) => (
        <span className="text-xs capitalize">{row.application_type.toLowerCase().replace("_", "-")}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: ApplicationResponse) => <StatusBadge status={row.status} />,
    },
    {
      key: "submitted_at",
      label: "Submitted",
      render: (row: ApplicationResponse) => (
        <span className="text-xs text-slate-500">{formatDate(row.submitted_at)}</span>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (row: ApplicationResponse) => (
        <span className="text-xs text-slate-500">{formatDate(row.created_at)}</span>
      ),
    },
  ];

  const statuses = [
    "", "DRAFT", "SUBMITTED", "UNDER_REVIEW", "SCHEDULED",
    "INSPECTION_IN_PROGRESS", "INSPECTION_COMPLETED", "VERIFIED",
    "CERTIFICATE_ISSUED", "REJECTED",
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Verification Applications"
        description="Manage verification and re-verification requests"
        badge={<FileText size={18} className="text-slate-400" />}
        actions={
          canCreate ? (
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition">
              <Plus size={16} /> New Application
            </button>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search by application number..."
          value={searchText}
          onChange={(e) => { setSearchText(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>{s ? s.replace(/_/g, " ") : "All Statuses"}</option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={data?.items || []}
        keyField="id"
        loading={isLoading}
        emptyTitle="No applications found"
        emptyDescription={canCreate ? "Create your first verification application." : "No applications match the current filters."}
        emptyAction={
          canCreate ? (
            <button onClick={() => setShowCreate(true)} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition">
              New Application
            </button>
          ) : undefined
        }
        onRowClick={(row) => router.push(`/applications/${row.id}`)}
        page={page}
        pageSize={20}
        total={data?.total || 0}
        onPageChange={setPage}
      />

      {showCreate && (
        <CreateApplicationModal
          onClose={() => setShowCreate(false)}
          onSuccess={(app) => {
            setShowCreate(false);
            router.push(`/applications/${app.id}`);
          }}
        />
      )}
    </div>
  );
}
