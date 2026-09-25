"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchCertificatesQuery, useListExpiringCertificatesQuery } from "@/features/certificates/certificateApi";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, daysUntil } from "@/utils/formatters";
import { CertificateDetailResponse } from "@/types";
import { Award, AlertTriangle } from "lucide-react";

type TabKey = "all" | "active" | "expiring" | "expired";

export default function CertificatesPage() {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("all");
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");

  const isExpiringTab = tab === "expiring";
  const statusFilter = tab === "active" ? "ACTIVE" : tab === "expired" ? "EXPIRED" : undefined;

  const { data: searchData, isLoading: searchLoading } = useSearchCertificatesQuery(
    {
      page,
      page_size: 20,
      status: statusFilter,
      certificate_number: searchText || undefined,
    },
    { skip: isExpiringTab }
  );

  const { data: expiringData, isLoading: expiringLoading } = useListExpiringCertificatesQuery({
    page,
    page_size: 20,
  });

  const data = isExpiringTab ? expiringData : searchData;
  const isLoading = isExpiringTab ? expiringLoading : searchLoading;
  const expiringCount = expiringData?.total ?? 0;

  const columns = [
    {
      key: "certificate_number",
      label: "Certificate No.",
      render: (row: CertificateDetailResponse) => (
        <span className="font-mono text-xs font-semibold text-slate-900">{row.certificate_number}</span>
      ),
    },
    {
      key: "instrument_registration_number",
      label: "Instrument",
      render: (row: CertificateDetailResponse) => (
        <span className="text-xs">{row.instrument_registration_number || "—"}</span>
      ),
    },
    {
      key: "issued_at",
      label: "Issued",
      render: (row: CertificateDetailResponse) => <span className="text-xs text-slate-500">{formatDate(row.issued_at)}</span>,
    },
    {
      key: "valid_until",
      label: "Valid Until",
      render: (row: CertificateDetailResponse) => {
        const days = daysUntil(row.valid_until);
        return (
          <div className="text-xs">
            <span className="text-slate-700">{formatDate(row.valid_until)}</span>
            {days <= 30 && days > 0 && (
              <span className="ml-1.5 text-amber-600 font-semibold">({days}d left)</span>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (row: CertificateDetailResponse) => <StatusBadge status={row.status} />,
    },
    {
      key: "issued_by_name",
      label: "Issued By",
      render: (row: CertificateDetailResponse) => <span className="text-xs text-slate-500">{row.issued_by_name || "—"}</span>,
    },
  ];

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "all", label: "All Certificates" },
    { key: "active", label: "Active" },
    { key: "expiring", label: "Expiring Soon", count: expiringCount },
    { key: "expired", label: "Expired" },
  ];

  return (
    <div className="space-y-4">
      <PageHeader title="Certificates" description="Digital verification certificates issued for instruments" badge={<Award size={18} className="text-slate-400" />} />

      {expiringCount > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm">
          <AlertTriangle size={18} className="text-amber-600 shrink-0" />
          <span className="text-amber-800">
            <strong>{expiringCount}</strong> certificate{expiringCount > 1 ? "s are" : " is"} expiring within 30 days.
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setPage(1); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
              tab === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-bold">{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by certificate number..."
        value={searchText}
        onChange={(e) => { setSearchText(e.target.value); setPage(1); }}
        className="px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 w-64"
      />

      <DataTable
        columns={columns}
        data={data?.items || []}
        keyField="id"
        loading={isLoading}
        emptyTitle="No certificates found"
        emptyDescription="No certificates match the current filters."
        onRowClick={(row) => router.push(`/certificates/${row.id}`)}
        page={page}
        pageSize={20}
        total={data?.total || 0}
        onPageChange={setPage}
      />
    </div>
  );
}
