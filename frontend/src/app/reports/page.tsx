"use client";

import React, { useState } from "react";
import { useAppSelector } from "@/store/hooks";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface ReportMeta {
  id: string;
  name: string;
  description: string;
  icon: string;
  endpoint: string;
  filename: string;
  allowedRoles: string[];
}

const REPORTS: ReportMeta[] = [
  {
    id: "applications",
    name: "Verification Applications Report",
    description:
      "Export all applications filtered by your tenancy, including status, applicant details, and timestamps.",
    icon: "assignment",
    endpoint: "/reports/applications",
    filename: "metrix_applications_report.csv",
    allowedRoles: ["ADMIN", "LMO", "GATC", "INSTRUMENT_OWNER"],
  },
  {
    id: "instruments",
    name: "Registered Instruments Report",
    description:
      "Comprehensive registry of weighing and measuring instruments with serials, models, and locations.",
    icon: "precision_manufacturing",
    endpoint: "/reports/instruments",
    filename: "metrix_instruments_report.csv",
    allowedRoles: ["ADMIN", "LMO", "INSTRUMENT_OWNER"],
  },
  {
    id: "verifications",
    name: "Verification & Inspection Logs",
    description:
      "Audit trail of field/lab verification events, assigned officers/GATC centres, and verification outcomes.",
    icon: "fact_check",
    endpoint: "/reports/verifications",
    filename: "metrix_verifications_report.csv",
    allowedRoles: ["ADMIN", "LMO", "GATC"],
  },
  {
    id: "certificates",
    name: "Digital Certificates Registry",
    description:
      "Full directory of issued verification certificates with validity periods and integrity hashes.",
    icon: "verified_user",
    endpoint: "/reports/certificates",
    filename: "metrix_certificates_report.csv",
    allowedRoles: ["ADMIN", "LMO", "GATC", "INSTRUMENT_OWNER"],
  },
  {
    id: "expiries",
    name: "Certificate Expiry & Renewal Forecast",
    description:
      "Dedicated report identifying active certificates due to expire within warning thresholds or already expired.",
    icon: "event_busy",
    endpoint: "/reports/expiries",
    filename: "metrix_expiries_report.csv",
    allowedRoles: ["ADMIN", "LMO", "INSTRUMENT_OWNER"],
  },
];

export default function ReportsPage() {
  const { user, token } = useAppSelector((state) => state.auth);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDownload = async (report: ReportMeta) => {
    setErrorMsg(null);
    setDownloadingId(report.id);

    try {
      const authToken =
        token ||
        (typeof window !== "undefined"
          ? localStorage.getItem("metrix_token")
          : null);

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
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to download CSV report.";
      setErrorMsg(message);
    } finally {
      setDownloadingId(null);
    }
  };

  const userRole = user?.role || "INSTRUMENT_OWNER";

  return (
    <AuthGuard>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <Card>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-headline font-bold tracking-tight text-on-surface">
              Operational Reporting & CSV Exports
            </h1>
            <Badge variant="neutral" size="md">
              {userRole}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-on-surface-variant">
            Generate and export audit-ready tabular data in standard CSV format.
            Data is strictly isolated by role and tenancy.
          </p>
        </Card>

        {/* Error Banner */}
        {errorMsg && (
          <div className="rounded-xl border border-error/30 bg-error-container/10 p-3 text-xs text-error font-medium flex items-center justify-between animate-slide-up">
            <span>{errorMsg}</span>
            <button
              onClick={() => setErrorMsg(null)}
              className="font-bold ml-4"
            >
              ×
            </button>
          </div>
        )}

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REPORTS.map((report) => {
            const isAllowed = report.allowedRoles.includes(userRole);
            const isBusy = downloadingId === report.id;

            return (
              <Card
                key={report.id}
                hoverable
                className={!isAllowed ? "opacity-60" : ""}
              >
                <div className="flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center">
                          <span className="material-symbols-outlined text-base text-secondary">
                            {report.icon}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-on-surface">
                          {report.name}
                        </h3>
                      </div>
                      <Badge variant="neutral">.CSV</Badge>
                    </div>
                    <p className="mt-3 text-xs text-on-surface-variant leading-relaxed">
                      {report.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-surface-variant/30 flex items-center justify-between">
                    <span className="text-[11px] text-outline">
                      {isAllowed
                        ? "RBAC Tenant Filtered"
                        : "Access Restricted for Role"}
                    </span>
                    <Button
                      variant="primary"
                      size="sm"
                      icon="download"
                      loading={isBusy}
                      disabled={!isAllowed}
                      onClick={() => handleDownload(report)}
                    >
                      Download CSV
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AuthGuard>
  );
}
