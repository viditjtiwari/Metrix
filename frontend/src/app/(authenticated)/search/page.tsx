"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchInstrumentsQuery } from "@/features/instruments/instrumentApi";
import { useGetApplicationsQuery } from "@/features/applications/applicationApi";
import {
  useSearchCertificatesQuery,
  useGetExpiringCertificatesQuery,
  useGetExpiredCertificatesQuery,
} from "@/features/certificates/certificateApi";

type SearchDomain = "instruments" | "applications" | "certificates";
type CertFilterType = "all" | "expiring" | "expired";

export default function SearchPage() {
  const [domain, setDomain] = useState<SearchDomain>("instruments");

  // Search input state
  const [query, setQuery] = useState("");
  const [certFilter, setCertFilter] = useState<CertFilterType>("all");

  // Query hooks
  const instrumentsQuery = useSearchInstrumentsQuery(
    domain === "instruments" ? { registration_number: query || undefined, manufacturer: query || undefined } : undefined,
    { skip: domain !== "instruments" }
  );

  const applicationsQuery = useGetApplicationsQuery(
    domain === "applications" ? { application_number: query || undefined } : undefined,
    { skip: domain !== "applications" }
  );

  const certSearchQuery = useSearchCertificatesQuery(
    domain === "certificates" && certFilter === "all" ? { certificate_number: query || undefined } : undefined,
    { skip: domain !== "certificates" || certFilter !== "all" }
  );

  const certExpiringQuery = useGetExpiringCertificatesQuery(undefined, {
    skip: domain !== "certificates" || certFilter !== "expiring",
  });

  const certExpiredQuery = useGetExpiredCertificatesQuery(undefined, {
    skip: domain !== "certificates" || certFilter !== "expired",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Advanced Search</h1>
        <p className="mt-1 text-xs text-slate-500">
          Query registered instruments, verification applications, and digital certificates across your tenancy.
        </p>

        {/* Domain Tabs */}
        <div className="flex gap-2 mt-4 border-b border-slate-100 pb-2">
          {(["instruments", "applications", "certificates"] as SearchDomain[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setDomain(tab);
                setQuery("");
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                domain === tab
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Bar & Sub-filters */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder={
              domain === "instruments"
                ? "Search by registration or manufacturer..."
                : domain === "applications"
                ? "Search by application number (e.g. APP-)..."
                : "Search by certificate number (e.g. CERT-)..."
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
          />

          {domain === "certificates" && (
            <div className="flex gap-1">
              {(["all", "expiring", "expired"] as CertFilterType[]).map((cf) => (
                <button
                  key={cf}
                  onClick={() => setCertFilter(cf)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize border transition ${
                    certFilter === cf
                      ? "border-emerald-600 bg-emerald-50 text-emerald-800"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {cf === "expiring" ? "Expiring Soon" : cf}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {domain === "instruments" && (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="p-3">Reg. Number</th>
                <th className="p-3">Type</th>
                <th className="p-3">Manufacturer / Model</th>
                <th className="p-3">Serial No.</th>
                <th className="p-3">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {instrumentsQuery.isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading instruments...</td></tr>
              ) : !instrumentsQuery.data?.items.length ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-400">No instruments found.</td></tr>
              ) : (
                instrumentsQuery.data.items.map((i) => (
                  <tr key={i.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-medium text-slate-900">{i.registration_number}</td>
                    <td className="p-3">{i.instrument_type}</td>
                    <td className="p-3">{i.manufacturer} - {i.model_name}</td>
                    <td className="p-3 font-mono">{i.serial_number}</td>
                    <td className="p-3">{i.location}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {domain === "applications" && (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="p-3">App Number</th>
                <th className="p-3">Instrument ID</th>
                <th className="p-3">Type</th>
                <th className="p-3">Status</th>
                <th className="p-3">Created</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {applicationsQuery.isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">Loading applications...</td></tr>
              ) : !applicationsQuery.data?.items.length ? (
                <tr><td colSpan={6} className="p-8 text-center text-slate-400">No applications found.</td></tr>
              ) : (
                applicationsQuery.data.items.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-medium text-slate-900">{app.application_number}</td>
                    <td className="p-3 font-mono">#{app.instrument_id}</td>
                    <td className="p-3">{app.application_type}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-mono text-[11px]">{app.status}</span></td>
                    <td className="p-3 text-slate-500">{new Date(app.created_at).toLocaleDateString()}</td>
                    <td className="p-3">
                      <Link href={`/applications/${app.id}`} className="text-emerald-600 hover:text-emerald-700 font-medium">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {domain === "certificates" && (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="p-3">Cert Number</th>
                <th className="p-3">App / Instrument</th>
                <th className="p-3">Valid From</th>
                <th className="p-3">Valid Until</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {(() => {
                const activeQuery =
                  certFilter === "expiring"
                    ? certExpiringQuery
                    : certFilter === "expired"
                    ? certExpiredQuery
                    : certSearchQuery;

                if (activeQuery.isLoading) {
                  return <tr><td colSpan={6} className="p-8 text-center text-slate-400">Loading certificates...</td></tr>;
                }
                if (!activeQuery.data?.items.length) {
                  return <tr><td colSpan={6} className="p-8 text-center text-slate-400">No certificates found.</td></tr>;
                }
                return activeQuery.data.items.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-semibold text-slate-900">{cert.certificate_number}</td>
                    <td className="p-3 font-mono text-slate-600">
                      {cert.application_number || `#${cert.application_id}`} / {cert.instrument_registration_number || `#${cert.instrument_id}`}
                    </td>
                    <td className="p-3">{cert.valid_from}</td>
                    <td className="p-3 font-medium">{cert.valid_until}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                          cert.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {cert.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <Link
                        href={`/verify?token=${encodeURIComponent(cert.verification_token)}`}
                        className="text-emerald-600 hover:text-emerald-700 font-medium"
                      >
                        Verify
                      </Link>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
