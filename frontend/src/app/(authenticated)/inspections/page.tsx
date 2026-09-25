"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { useListInspectionsQuery } from "@/features/inspections/inspectionApi";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/utils/formatters";
import { InspectionResponse, InspectionResult } from "@/types";
import { ClipboardCheck, Download, ExternalLink, Filter, Calendar } from "lucide-react";

type ResultTab = "all" | "PENDING" | "VERIFIED" | "REJECTED";

export default function InspectionsPage() {
  const router = useRouter();
  const { user, token } = useAppSelector((state) => state.auth);
  const [resultTab, setResultTab] = useState<ResultTab>("all");
  const [filterMyAssigned, setFilterMyAssigned] = useState(false);
  const [page, setPage] = useState(1);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const isVerifier = user?.role === "LMO" || user?.role === "GATC";

  const { data, isLoading } = useListInspectionsQuery({
    page,
    page_size: 20,
    verifier_id: filterMyAssigned && user?.id ? user.id : undefined,
    result: resultTab === "all" || resultTab === "PENDING" ? undefined : (resultTab as InspectionResult),
  });

  const handleDownloadReport = async (inspectionId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setDownloadingId(inspectionId);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/inspections/${inspectionId}/report/download`,
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("metrix_token")}`,
          },
        }
      );
      if (!res.ok) throw new Error("Report download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Inspection_Report_${inspectionId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      alert("Could not download inspection report PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  const columns = [
    {
      key: "application_number",
      label: "Application",
      render: (row: InspectionResponse) => (
        <span className="font-mono font-semibold text-slate-900 text-xs">
          {row.application_number || `App #${row.application_id}`}
        </span>
      ),
    },
    {
      key: "scheduled_date",
      label: "Schedule",
      render: (row: InspectionResponse) => (
        <div className="text-xs">
          <span className="font-medium text-slate-800">{row.scheduled_date || "TBD"}</span>
          {row.scheduled_time && (
            <span className="text-[11px] text-slate-500 block">{row.scheduled_time}</span>
          )}
        </div>
      ),
    },
    {
      key: "assigned_to_name",
      label: "Assigned Verifier",
      render: (row: InspectionResponse) => (
        <div className="text-xs">
          <span className="font-semibold text-slate-800">{row.assigned_to_name || "Unassigned"}</span>
          {row.assigned_to_role && (
            <span className="text-[10px] text-slate-400 block font-mono">[{row.assigned_to_role}]</span>
          )}
        </div>
      ),
    },
    {
      key: "inspection_mode",
      label: "Mode",
      render: (row: InspectionResponse) => (
        <span
          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
            row.inspection_mode === "GATC_LAB"
              ? "bg-purple-50 text-purple-700 border-purple-200"
              : "bg-blue-50 text-blue-700 border-blue-200"
          }`}
        >
          {row.inspection_mode === "GATC_LAB" ? "GATC Lab" : "LMO Field"}
        </span>
      ),
    },
    {
      key: "inspection_location",
      label: "Location",
      render: (row: InspectionResponse) => (
        <span className="text-xs text-slate-600 truncate max-w-[140px] block">
          {row.inspection_location || "—"}
        </span>
      ),
    },
    {
      key: "result",
      label: "Outcome",
      render: (row: InspectionResponse) => (
        <StatusBadge
          status={
            row.result === "VERIFIED"
              ? "VERIFIED"
              : row.result === "REJECTED"
              ? "REJECTED"
              : row.started_at
              ? "INSPECTION_IN_PROGRESS"
              : "SCHEDULED"
          }
        />
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: InspectionResponse) => (
        <div className="flex items-center gap-2">
          {row.result && (
            <button
              onClick={(e) => handleDownloadReport(row.id, e)}
              disabled={downloadingId === row.id}
              className="p-1 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              title="Download Inspection Report PDF"
            >
              <Download size={14} />
            </button>
          )}
          <Link
            href={`/applications/${row.application_id}`}
            onClick={(e) => e.stopPropagation()}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-semibold inline-flex items-center gap-0.5"
          >
            Open <ExternalLink size={12} />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inspections & Verification Queue"
        description="Statutory inspection calendar, verifier allocations, calibration observations, and outcome determinations."
        badge={<ClipboardCheck size={18} className="text-slate-400" />}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "all", label: "All Inspections" },
              { id: "PENDING", label: "Scheduled / Pending" },
              { id: "VERIFIED", label: "Verified (Pass)" },
              { id: "REJECTED", label: "Rejected" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setResultTab(tab.id);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                resultTab === tab.id
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isVerifier && (
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
            <input
              type="checkbox"
              checked={filterMyAssigned}
              onChange={(e) => {
                setFilterMyAssigned(e.target.checked);
                setPage(1);
              }}
              className="rounded text-emerald-600 focus:ring-emerald-500"
            />
            Show Only My Assigned
          </label>
        )}
      </div>

      <DataTable<InspectionResponse>
        columns={columns}
        data={data?.items || []}
        keyField="id"
        loading={isLoading}
        emptyTitle="No inspection records found"
        emptyDescription="No inspections match the selected status or verifier criteria."
        onRowClick={(row) => router.push(`/applications/${row.application_id}`)}
        page={page}
        pageSize={20}
        total={data?.total || 0}
        onPageChange={setPage}
      />
    </div>
  );
}
