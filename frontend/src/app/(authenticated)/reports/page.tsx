"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface ReportMeta {
  id: string;
  name: string;
  description: string;
  endpoint: string;
  filename: string;
  allowedRoles: string[];
}

const REPORTS: ReportMeta[] = [
  {
    id: "applications",
    name: "Verification Applications Report",
    description: "Export all applications filtered by your tenancy, including status, applicant details, and timestamps.",
    endpoint: "/reports/applications",
    filename: "metrix_applications_report.csv",
    allowedRoles: ["ADMIN", "LMO", "GATC", "INSTRUMENT_OWNER"],
  },
  {
    id: "instruments",
    name: "Registered Instruments Report",
    description: "Comprehensive registry of weighing and measuring instruments with serials, models, and locations.",
    endpoint: "/reports/instruments",
    filename: "metrix_instruments_report.csv",
    allowedRoles: ["ADMIN", "LMO", "INSTRUMENT_OWNER"],
  },
  {
    id: "verifications",
    name: "Verification & Inspection Logs",
    description: "Audit trail of field/lab verification events, assigned officers/GATC centres, and verification outcomes.",
    endpoint: "/reports/verifications",
    filename: "metrix_verifications_report.csv",
    allowedRoles: ["ADMIN", "LMO", "GATC"],
  },
  {
    id: "certificates",
    name: "Digital Certificates Registry",
    description: "Full directory of issued verification certificates with validity periods and integrity hashes.",
    endpoint: "/reports/certificates",
    filename: "metrix_certificates_report.csv",
    allowedRoles: ["ADMIN", "LMO", "GATC", "INSTRUMENT_OWNER"],
  },
  {
    id: "expiries",
    name: "Certificate Expiry & Renewal Forecast",
    description: "Dedicated report identifying active certificates due to expire within warning thresholds or already expired.",
    endpoint: "/reports/expiries",
    filename: "metrix_expiries_report.csv",
    allowedRoles: ["ADMIN", "LMO", "INSTRUMENT_OWNER"],
  },
];

export default function ReportsPage() {
  const { user, isAuthenticated, token } = useAppSelector((state) => state.auth);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-xs">
        <h2 className="text-base font-semibold text-slate-900">Sign In Required</h2>
        <p className="mt-1 text-xs text-slate-500">
          Please sign in to access operational reports and CSV data exports.
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

  const handleDownload = async (report: ReportMeta) => {
    setErrorMsg(null);
    setDownloadingId(report.id);

    try {
      const authToken =
        token || (typeof window !== "undefined" ? localStorage.getItem("metrix_token") : null);

      const res = await fetch(`${API_BASE_URL}${report.endpoint}`, {
        headers: {
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error(`Export failed with HTTP status ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", report.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to download CSV report.");
    } finally {
      setDownloadingId(null);
    }
  };

  const userRole = user?.role || "INSTRUMENT_OWNER";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Operational Reporting & CSV Exports
          </h1>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-xs font-semibold">
            {userRole}
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Generate and export audit-ready tabular data in standard CSV format. Data is strictly isolated by role and tenancy.
        </p>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex justify-between items-center">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="font-bold ml-2">
            &times;
          </button>
        </div>
      )}

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORTS.map((report) => {
          const isAllowed = report.allowedRoles.includes(userRole);
          const isBusy = downloadingId === report.id;

          return (
            <div
              key={report.id}
              className={`p-5 rounded-xl border bg-white shadow-xs flex flex-col justify-between transition ${
                isAllowed ? "border-slate-200" : "border-slate-100 opacity-60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{report.name}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-200">
                    .CSV
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  {report.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {isAllowed ? "RBAC Tenant Filtered" : "Access Restricted for Role"}
                </span>
                <button
                  onClick={() => handleDownload(report)}
                  disabled={!isAllowed || isBusy}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isBusy ? "Generating CSV..." : "Download CSV"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
