"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CertificateDetailResponse } from "@/types";
import { useAppSelector } from "@/store/hooks";

interface CertificateCardProps {
  certificate: CertificateDetailResponse;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ certificate }) => {
  const { token } = useAppSelector((state) => state.auth);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const isExpired = certificate.status === "EXPIRED";

  const handleCopyHash = () => {
    navigator.clipboard.writeText(certificate.integrity_hash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"}/certificates/${certificate.id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token || localStorage.getItem("metrix_token")}`,
          },
        }
      );
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${certificate.certificate_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Could not download certificate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-xs text-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            ✓
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Digital Verification Certificate</h3>
            <span className="font-mono text-emerald-800 font-semibold">{certificate.certificate_number}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
              isExpired
                ? "bg-rose-50 text-rose-700 border-rose-200"
                : "bg-emerald-100 text-emerald-800 border-emerald-300"
            }`}
          >
            ● {certificate.status}
          </span>
        </div>
      </div>

      {/* Validity & Verification Details */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 bg-white/80 p-3.5 rounded-lg border border-emerald-100">
        <div>
          <span className="text-slate-400 block font-medium">Issue Date</span>
          <span className="font-semibold text-slate-800">
            {new Date(certificate.issued_at).toLocaleDateString()}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Valid From</span>
          <span className="font-semibold text-slate-800">{certificate.valid_from}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Valid Until</span>
          <span className={`font-semibold ${isExpired ? "text-rose-600" : "text-emerald-700"}`}>
            {certificate.valid_until}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Issuing Officer</span>
          <span className="font-semibold text-slate-800">{certificate.issued_by_name || "LMO Authority"}</span>
        </div>
        <div>
          <span className="text-slate-400 block font-medium">Inspecting Officer</span>
          <span className="font-semibold text-slate-800">{certificate.inspecting_officer_name || "Verified by Inspector"}</span>
        </div>
      </div>

      {/* SHA-256 Digest Box */}
      <div className="bg-slate-900 text-slate-200 p-3 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="overflow-hidden">
          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
            <span>SHA-256 INTEGRITY DIGEST (TAMPER-EVIDENT)</span>
          </div>
          <p className="font-mono text-[11px] text-emerald-400 truncate mt-0.5">
            {certificate.integrity_hash}
          </p>
        </div>
        <button
          onClick={handleCopyHash}
          className="shrink-0 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 border border-slate-700 transition"
        >
          {copied ? "Copied!" : "Copy Digest"}
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-xs disabled:opacity-50"
        >
          {downloading ? "Downloading..." : "⬇ Download Official PDF"}
        </button>

        <Link
          href={`/verify/${certificate.verification_token}`}
          target="_blank"
          className="px-4 py-2 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs transition flex items-center gap-1.5 shadow-xs"
        >
          🔍 View Public QR Verification
        </Link>
      </div>
    </div>
  );
};
