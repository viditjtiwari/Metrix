"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useGetCertificateQuery, useDownloadCertificateMutation } from "@/features/certificates/certificateApi";
import { PageHeader } from "@/components/ui/PageHeader";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatDateTime, daysUntil } from "@/utils/formatters";
import { Award, Download, ArrowLeft, ExternalLink, Shield } from "lucide-react";

export default function CertificateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: cert, isLoading, isError } = useGetCertificateQuery(Number(id));
  const [downloadPdf, { isLoading: isDownloading }] = useDownloadCertificateMutation();

  if (isLoading) return <LoadingSpinner text="Loading certificate..." />;
  if (isError || !cert) {
    return (
      <div className="p-6 text-center text-sm text-red-600 bg-red-50 rounded-xl border border-red-200">
        Certificate not found or you don't have permission to view it.
      </div>
    );
  }

  const days = daysUntil(cert.valid_until);

  const handleDownload = async () => {
    try {
      const blob = await downloadPdf(cert.id).unwrap();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificate-${cert.certificate_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* error handled by RTK Query */ }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/certificates" className="h-8 w-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition">
          <ArrowLeft size={18} />
        </Link>
        <PageHeader
          title={cert.certificate_number}
          badge={<StatusBadge status={cert.status} size="md" />}
          actions={
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition disabled:opacity-50"
            >
              <Download size={16} /> {isDownloading ? "Downloading..." : "Download PDF"}
            </button>
          }
        />
      </div>

      {/* Expiry Warning */}
      {cert.status === "ACTIVE" && days <= 30 && days > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          <Award size={18} className="text-amber-600" />
          This certificate expires in <strong>{days} days</strong>. Consider submitting a re-verification application.
        </div>
      )}

      {/* Certificate Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award size={18} className="text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900">Certificate Details</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Certificate Number", value: cert.certificate_number },
            { label: "Issued At", value: formatDateTime(cert.issued_at) },
            { label: "Valid From", value: formatDate(cert.valid_from) },
            { label: "Valid Until", value: formatDate(cert.valid_until) },
            { label: "Issued By", value: cert.issued_by_name || "—" },
            { label: "Application", value: cert.application_number || "—" },
            { label: "Status", value: cert.status },
          ].map((f) => (
            <div key={f.label}>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">{f.label}</div>
              <div className="mt-1 text-sm font-semibold text-slate-800">{f.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Instrument Info */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-base font-bold text-slate-900 mb-4">Instrument Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Registration No.", value: cert.instrument_registration_number },
            { label: "Type", value: cert.instrument_type },
            { label: "Manufacturer", value: cert.manufacturer },
            { label: "Model", value: cert.model_name },
            { label: "Serial Number", value: cert.serial_number },
            { label: "Capacity", value: cert.capacity },
          ].map((f) => (
            <div key={f.label}>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">{f.label}</div>
              <div className="mt-1 text-sm font-semibold text-slate-800">{f.value || "—"}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Integrity & Verification */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={18} className="text-emerald-600" />
          <h2 className="text-base font-bold text-slate-900">Integrity & Verification</h2>
        </div>
        <div className="space-y-3">
          <div>
            <div className="text-xs font-medium text-slate-400 uppercase">SHA-256 Integrity Hash</div>
            <div className="mt-1 font-mono text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 break-all">{cert.integrity_hash}</div>
          </div>
          {cert.verification_url && (
            <div>
              <div className="text-xs font-medium text-slate-400 uppercase">Public Verification URL</div>
              <Link href={cert.verification_url} target="_blank" className="mt-1 flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 transition">
                {cert.verification_url} <ExternalLink size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
