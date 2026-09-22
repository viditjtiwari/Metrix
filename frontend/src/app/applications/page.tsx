"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useGetApplicationsQuery } from "@/features/applications/applicationApi";
import { ApplicationStatusBadge } from "@/features/applications/ApplicationStatusBadge";
import { ApplicationsPulseRail } from "@/features/applications/ApplicationsPulseRail";
import { RegisterInstrumentModal } from "@/features/instruments/RegisterInstrumentModal";
import { CreateApplicationModal } from "@/features/applications/CreateApplicationModal";
import { ApplicationResponse, ApplicationStatus } from "@/types";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";

const statusFilters: { label: string; value?: ApplicationStatus }[] = [
  { label: "All" },
  { label: "Draft", value: "DRAFT" },
  { label: "Submitted", value: "SUBMITTED" },
  { label: "Under Review", value: "UNDER_REVIEW" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "In Progress", value: "INSPECTION_IN_PROGRESS" },
  { label: "Verified", value: "VERIFIED" },
  { label: "Rejected", value: "REJECTED" },
];

export default function ApplicationsListPage() {
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [preselectedInstId, setPreselectedInstId] = useState<number | undefined>();
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useGetApplicationsQuery({
    status: selectedStatus,
    page,
    pageSize: 20,
  });

  const filteredItems = (data?.items || []).filter((app) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      app.application_number.toLowerCase().includes(q) ||
      String(app.instrument_id).includes(q)
    );
  });

  const columns = [
    {
      key: "application_number",
      header: "Application No.",
      render: (row: ApplicationResponse) => (
        <span className="font-mono font-bold text-on-surface">
          {row.application_number}
        </span>
      ),
    },
    {
      key: "instrument_id",
      header: "Instrument",
      render: (row: ApplicationResponse) => (
        <span className="font-mono text-secondary">
          INST-#{row.instrument_id}
        </span>
      ),
    },
    {
      key: "application_type",
      header: "Category",
      render: (row: ApplicationResponse) => (
        <span className="inline-flex px-2 py-0.5 rounded bg-surface-container text-on-surface text-[10px] font-semibold">
          {row.application_type}
        </span>
      ),
    },
    {
      key: "status",
      header: "Workflow Status",
      render: (row: ApplicationResponse) => (
        <ApplicationStatusBadge status={row.status} />
      ),
    },
    {
      key: "submitted_at",
      header: "Submission Date",
      render: (row: ApplicationResponse) => (
        <span className="text-on-surface-variant text-[11px]">
          {row.submitted_at
            ? new Date(row.submitted_at).toLocaleDateString()
            : "Draft"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Action",
      className: "text-right",
      render: (row: ApplicationResponse) => (
        <Link
          href={`/applications/${row.id}`}
          className="inline-flex items-center gap-1 font-semibold text-secondary hover:text-secondary-container transition"
        >
          <span>Inspect</span>
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </Link>
      ),
    },
  ];

  return (
    <AuthGuard>
      <div className="space-y-6 animate-fade-in">
        <ApplicationsPulseRail />

        {/* Action Bar & Search */}
        <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-variant/50 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 flex items-center gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-outline text-lg">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Application Number (APP-...) or Instrument ID..."
                className="w-full pl-9 pr-3 py-1.5 bg-surface-container-low rounded-lg text-xs text-on-surface placeholder:text-outline focus:outline-hidden focus:bg-surface-container-lowest border border-transparent focus:border-secondary transition"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setBannerMessage(null);
                setShowRegisterModal(true);
              }}
            >
              <span className="material-symbols-outlined text-base">add</span>
              <span>Register Instrument</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setBannerMessage(null);
                setPreselectedInstId(undefined);
                setShowCreateModal(true);
              }}
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span>+ New Application</span>
            </Button>
            <button
              onClick={() => refetch()}
              className="p-1.5 rounded-lg border border-surface-variant text-outline hover:text-on-surface transition"
              title="Refresh"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
            </button>
          </div>
        </div>

        {bannerMessage && (
          <div className="rounded-xl border border-tertiary/30 bg-tertiary-container/10 p-3 text-xs text-tertiary font-medium flex items-center justify-between shadow-xs">
            <span>{bannerMessage}</span>
            <button onClick={() => setBannerMessage(null)} className="font-bold ml-4">
              ×
            </button>
          </div>
        )}

        {/* Regulatory Status Filter Navigation Tabs */}
        <div className="bg-surface-container-lowest p-1 rounded-xl border border-surface-variant/40 shadow-xs flex items-center gap-1 overflow-x-auto text-xs">
          {statusFilters.map((tab) => {
            const isActive = selectedStatus === tab.value;
            return (
              <button
                key={tab.label}
                onClick={() => {
                  setSelectedStatus(tab.value);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition flex items-center gap-1.5 ${
                  isActive
                    ? "bg-primary-container text-on-secondary shadow-xs font-bold"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Applications Data Table */}
        <DataTable
          columns={columns}
          data={filteredItems}
          keyExtractor={(app) => app.id}
          isLoading={isLoading}
          emptyTitle="No verification applications found"
          emptyDescription="There are no applications matching your current filter criteria."
          pagination={{
            page,
            pageSize: 20,
            total: data?.total || 0,
            onPageChange: setPage,
          }}
        />

        {showRegisterModal && (
          <RegisterInstrumentModal
            onClose={() => setShowRegisterModal(false)}
            onSuccess={(inst) => {
              setBannerMessage(
                `Instrument registered successfully! Reg Number: ${inst.registration_number}`
              );
              setPreselectedInstId(inst.id);
              setShowCreateModal(true);
            }}
          />
        )}

        {showCreateModal && (
          <CreateApplicationModal
            preselectedInstrumentId={preselectedInstId}
            onClose={() => setShowCreateModal(false)}
            onSuccess={(newApp) => {
              setBannerMessage(
                `Application created! Number: ${newApp.application_number} (${newApp.status})`
              );
              refetch();
            }}
          />
        )}
      </div>
    </AuthGuard>
  );
}
