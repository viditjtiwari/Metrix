"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CertificateDetailResponse } from "@/types";
import { useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface CertificateCardProps {
  certificate: CertificateDetailResponse;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({
  certificate,
}) => {
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
        `${
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"
        }/certificates/${certificate.id}/download`,
        {
          headers: {
            Authorization: `Bearer ${
              token || localStorage.getItem("metrix_token")
            }`,
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
    } catch {
      alert("Could not download certificate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-tertiary/20 bg-tertiary-container/10 p-5 shadow-xs text-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-variant/40 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-tertiary text-on-secondary flex items-center justify-center font-bold text-sm shadow-xs">
            <span className="material-symbols-outlined text-base">verified</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-surface">
              Digital Verification Certificate
            </h3>
            <span className="font-mono text-tertiary font-semibold">
              {certificate.certificate_number}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isExpired ? "error" : "success"}>
            {certificate.status}
          </Badge>
        </div>
      </div>

      {/* Validity & Verification Details */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-surface-container-lowest p-3.5 rounded-xl border border-surface-variant/40">
        <div>
          <span className="text-outline block font-medium">Issue Date</span>
          <span className="font-semibold text-on-surface">
            {new Date(certificate.issued_at).toLocaleDateString()}
          </span>
        </div>
        <div>
          <span className="text-outline block font-medium">Valid From</span>
          <span className="font-semibold text-on-surface">
            {certificate.valid_from}
          </span>
        </div>
        <div>
          <span className="text-outline block font-medium">Valid Until</span>
          <span
            className={`font-semibold ${
              isExpired ? "text-error" : "text-tertiary"
            }`}
          >
            {certificate.valid_until}
          </span>
        </div>
        <div>
          <span className="text-outline block font-medium">Certified Officer</span>
          <span className="font-semibold text-on-surface">
            {certificate.issued_by_name || "LMO Authority"}
          </span>
        </div>
      </div>

      {/* SHA-256 Digest Box */}
      <div className="bg-surface-container-highest/80 text-on-surface p-3 rounded-xl border border-surface-variant/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="overflow-hidden">
          <div className="text-[10px] text-outline font-mono flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">shield</span>
            <span>SHA-256 INTEGRITY DIGEST (TAMPER-EVIDENT)</span>
          </div>
          <p className="font-mono text-[11px] text-tertiary truncate mt-0.5 font-medium">
            {certificate.integrity_hash}
          </p>
        </div>
        <button
          onClick={handleCopyHash}
          className="shrink-0 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-[11px] text-on-surface border border-surface-variant/40 transition"
        >
          {copied ? "Copied!" : "Copy Digest"}
        </button>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Button
          onClick={handleDownload}
          isLoading={downloading}
          variant="primary"
          size="sm"
        >
          ⬇ Download Official PDF
        </Button>

        <Link
          href={`/verify/${certificate.verification_token}`}
          target="_blank"
        >
          <Button variant="outline" size="sm">
            🔍 View Public QR Verification
          </Button>
        </Link>
      </div>
    </div>
  );
};
