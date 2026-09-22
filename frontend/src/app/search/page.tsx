"use client";

import React, { useState } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { useSearchInstrumentsQuery } from "@/features/instruments/instrumentApi";
import { useGetApplicationsQuery } from "@/features/applications/applicationApi";
import {
  useSearchCertificatesQuery,
  useGetExpiringCertificatesQuery,
  useGetExpiredCertificatesQuery,
} from "@/features/certificates/certificateApi";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { DataTable } from "@/components/ui/DataTable";
import {
  instrumentColumns,
  applicationColumns,
  certColumns,
} from "@/features/search/searchColumns";

type SearchDomain = "instruments" | "applications" | "certificates";
type CertFilterType = "all" | "expiring" | "expired";

const domainTabs: { key: SearchDomain; label: string; icon: string }[] = [
  { key: "instruments", label: "Instruments", icon: "precision_manufacturing" },
  { key: "applications", label: "Applications", icon: "assignment" },
  { key: "certificates", label: "Certificates", icon: "verified_user" },
];

export default function SearchPage() {
  const [domain, setDomain] = useState<SearchDomain>("instruments");
  const [query, setQuery] = useState("");
  const [certFilter, setCertFilter] = useState<CertFilterType>("all");

  const instrumentsQuery = useSearchInstrumentsQuery(
    domain === "instruments"
      ? {
          registration_number: query || undefined,
          manufacturer: query || undefined,
        }
      : undefined,
    { skip: domain !== "instruments" }
  );

  const applicationsQuery = useGetApplicationsQuery(
    domain === "applications"
      ? { application_number: query || undefined }
      : undefined,
    { skip: domain !== "applications" }
  );

  const certSearchQuery = useSearchCertificatesQuery(
    domain === "certificates" && certFilter === "all"
      ? { certificate_number: query || undefined }
      : undefined,
    { skip: domain !== "certificates" || certFilter !== "all" }
  );

  const certExpiringQuery = useGetExpiringCertificatesQuery(undefined, {
    skip: domain !== "certificates" || certFilter !== "expiring",
  });

  const certExpiredQuery = useGetExpiredCertificatesQuery(undefined, {
    skip: domain !== "certificates" || certFilter !== "expired",
  });

  return (
    <AuthGuard>
      <div className="space-y-6 animate-fade-in">
        {/* Page Header */}
        <div>
          <h1 className="font-headline font-bold text-xl text-on-surface">
            Registry Search
          </h1>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Cross-domain search across instruments, verification applications,
            and digital certificates.
          </p>
        </div>

        {/* Domain Switcher */}
        <div className="flex border-b border-surface-variant/40 gap-1">
          {domainTabs.map((t) => (
            <button
              key={t.key}
              onClick={() => {
                setDomain(t.key);
                setQuery("");
              }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition ${
                domain === t.key
                  ? "border-secondary text-secondary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface hover:border-surface-variant"
              }`}
            >
              <span className="material-symbols-outlined text-base">
                {t.icon}
              </span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Search Bar & Filters */}
        <Card>
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
            <div className="flex-1">
              <Input
                label={`Search ${domain}`}
                placeholder={
                  domain === "instruments"
                    ? "Filter by registration number, manufacturer..."
                    : domain === "applications"
                    ? "Filter by application number..."
                    : "Filter by certificate number..."
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                icon="search"
              />
            </div>

            {domain === "certificates" && (
              <div className="flex gap-1">
                {(["all", "expiring", "expired"] as CertFilterType[]).map(
                  (cf) => (
                    <button
                      key={cf}
                      onClick={() => setCertFilter(cf)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition ${
                        certFilter === cf
                          ? "border-secondary bg-secondary/5 text-secondary"
                          : "border-surface-variant/40 bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low"
                      }`}
                    >
                      {cf === "expiring" ? "Expiring Soon" : cf}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Results */}
        {domain === "instruments" && (
          <DataTable
            columns={instrumentColumns}
            data={instrumentsQuery.data?.items || []}
            keyExtractor={(r) => r.id}
            isLoading={instrumentsQuery.isLoading}
            isError={instrumentsQuery.isError}
            emptyIcon="precision_manufacturing"
            emptyTitle="No instruments found"
            emptyDescription="Try adjusting your search query."
          />
        )}

        {domain === "applications" && (
          <DataTable
            columns={applicationColumns}
            data={applicationsQuery.data?.items || []}
            keyExtractor={(r) => r.id}
            isLoading={applicationsQuery.isLoading}
            isError={applicationsQuery.isError}
            emptyIcon="assignment"
            emptyTitle="No applications found"
            emptyDescription="Try adjusting your search query."
          />
        )}

        {domain === "certificates" && (() => {
          const activeQuery =
            certFilter === "expiring"
              ? certExpiringQuery
              : certFilter === "expired"
              ? certExpiredQuery
              : certSearchQuery;

          return (
            <DataTable
              columns={certColumns}
              data={activeQuery.data?.items || []}
              keyExtractor={(r) => r.id}
              isLoading={activeQuery.isLoading}
              isError={activeQuery.isError}
              emptyIcon="verified_user"
              emptyTitle="No certificates found"
              emptyDescription="Try adjusting your search query."
            />
          );
        })()}
      </div>
    </AuthGuard>
  );
}
