"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AuthGuard } from "@/components/auth/AuthGuard";
import {
  useSearchCertificatesQuery,
  useGetExpiringCertificatesQuery,
  useGetExpiredCertificatesQuery,
} from "@/features/certificates/certificateApi";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { CertificateDetailResponse } from "@/types";

type CertTab = "all" | "expiring" | "expired";

const tabConfig: { key: CertTab; label: string; icon: string }[] = [
  { key: "all", label: "All Certificates", icon: "verified_user" },
  { key: "expiring", label: "Expiring Soon", icon: "schedule" },
  { key: "expired", label: "Expired", icon: "event_busy" },
];

export default function CertificatesPage() {
  const [activeTab, setActiveTab] = useState<CertTab>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const allQuery = useSearchCertificatesQuery(
    {
      certificate_number: searchQuery || undefined,
      page,
      page_size: 20,
    },
    { skip: activeTab !== "all" }
  );

  const expiringQuery = useGetExpiringCertificatesQuery(
    { page, page_size: 20 },
    { skip: activeTab !== "expiring" }
  );

  const expiredQuery = useGetExpiredCertificatesQuery(
    { page, page_size: 20 },
    { skip: activeTab !== "expired" }
  );

  const activeQuery =
    activeTab === "expiring"
      ? expiringQuery
      : activeTab === "expired"
      ? expiredQuery
      : allQuery;

  const items = activeQuery.data?.items || [];
  const total = activeQuery.data?.total || 0;

  const columns = [
    {
      key: "cert_number",
      header: "Certificate No.",
      render: (row: CertificateDetailResponse) => (
        <span className="font-mono font-bold text-on-surface">
          {row.certificate_number}
        </span>
      ),
    },
    {
      key: "instrument",
      header: "Instrument",
      render: (row: CertificateDetailResponse) => (
        <div className="space-y-0.5">
          <div className="font-mono text-xs text-secondary">
            {row.instrument_registration_number || `#${row.instrument_id}`}
          </div>
          <div className="text-[10px] text-on-surface-variant">
            {row.instrument_type} — {row.manufacturer}
          </div>
        </div>
      ),
    },
    {
      key: "valid_from",
      header: "Valid From",
      render: (row: CertificateDetailResponse) => (
        <span className="text-on-surface-variant">
          {new Date(row.valid_from).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "valid_until",
      header: "Valid Until",
      render: (row: CertificateDetailResponse) => (
        <span className="font-semibold text-on-surface">
          {new Date(row.valid_until).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: CertificateDetailResponse) => (
        <Badge
          variant={row.status === "ACTIVE" ? "success" : "error"}
          dot
          size="md"
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (row: CertificateDetailResponse) => (
        <div className="flex items-center gap-1 justify-end">
          <Link
            href={`/verify?token=${encodeURIComponent(row.verification_token)}`}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-secondary hover:bg-secondary/10 transition"
          >
            <span className="material-symbols-outlined text-sm">
              qr_code_2
            </span>
            Verify
          </Link>
          <Link
            href={`/applications/${row.application_id}`}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-on-surface-variant hover:bg-surface-container-low transition"
          >
            <span className="material-symbols-outlined text-sm">
              open_in_new
            </span>
            View
          </Link>
        </div>
      ),
    },
  ];

  return (
    <AuthGuard>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <Card>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-secondary text-xs uppercase font-semibold tracking-wider">
                <span className="material-symbols-outlined text-base">
                  verified_user
                </span>
                <span>Certificate Registry</span>
              </div>
              <h1 className="font-headline font-bold text-2xl text-on-surface tracking-tight mt-0.5">
                Digital Certificates
              </h1>
              <p className="text-xs text-on-surface-variant mt-1">
                View, verify, and manage all issued verification certificates.
              </p>
            </div>
            <Button
              variant="outline"
              icon="refresh"
              onClick={() => activeQuery.refetch()}
            >
              Refresh
            </Button>
          </div>
        </Card>

        {/* Tabs */}
        <Card padding="sm">
          <div className="flex items-center gap-1">
            {tabConfig.map((tab) => (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveTab(tab.key);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg font-medium text-xs flex items-center gap-1.5 transition ${
                  activeTab === tab.key
                    ? "bg-primary-container text-on-secondary shadow-xs font-bold"
                    : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Search (only for "all" tab) */}
        {activeTab === "all" && (
          <Card padding="sm">
            <Input
              icon="search"
              placeholder="Search by certificate number (e.g. CERT-...)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Card>
        )}

        {/* Table */}
        <DataTable
          columns={columns}
          data={items}
          keyExtractor={(row) => row.id}
          isLoading={activeQuery.isLoading}
          isError={activeQuery.isError}
          emptyIcon="verified_user"
          emptyTitle={
            activeTab === "expiring"
              ? "No certificates expiring soon"
              : activeTab === "expired"
              ? "No expired certificates"
              : "No certificates found"
          }
          emptyDescription="Certificates are issued after successful instrument verification."
          page={page}
          pageSize={20}
          total={total}
          onPageChange={setPage}
        />
      </div>
    </AuthGuard>
  );
}
