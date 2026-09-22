"use client";

import React, { useState } from "react";

export interface PublicCertData {
  certificate_number: string;
  instrument_registration_number: string;
  instrument_type: string;
  manufacturer: string;
  model: string;
  serial_number?: string;
  verification_result: string;
  issued_at: string;
  valid_from: string;
  valid_until: string;
  status: "ACTIVE" | "EXPIRED" | string;
  integrity_hash: string;
}

export function VerificationResultCard({ data }: { data: PublicCertData }) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const copyHash = () => {
    if (data.integrity_hash) {
      navigator.clipboard.writeText(data.integrity_hash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/verify?token=${encodeURIComponent(data.certificate_number)}`;
    navigator.clipboard.writeText(url);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const isActive = data.status === "ACTIVE";

  return (
    <div className="w-full bg-surface-container-lowest rounded-xl border border-surface-variant/60 shadow-lg overflow-hidden transition-all animate-in fade-in duration-300">
      {/* Top Banner with Sovereign Seal */}
      <div
        className={`px-6 py-4 flex flex-wrap items-center justify-between gap-3 ${
          isActive
            ? "bg-tertiary-container/10 border-b border-tertiary/20"
            : "bg-error-container/20 border-b border-error/20"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isActive ? "bg-tertiary text-on-secondary" : "bg-error text-on-error"
            }`}
          >
            <span className="material-symbols-outlined text-2xl">
              {isActive ? "verified" : "error"}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                  isActive
                    ? "bg-tertiary text-on-secondary"
                    : "bg-error text-on-error"
                }`}
              >
                {isActive ? "OFFICIALLY VERIFIED & ACTIVE" : "CERTIFICATE EXPIRED"}
              </span>
              <span className="text-xs text-outline font-mono">
                {data.certificate_number}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Directorate of Legal Metrology • Statutory Stamp Authenticated
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-[11px] text-outline uppercase font-semibold">
              Status Validity
            </span>
            <div className="text-xs font-bold text-on-surface">
              {data.valid_from} &rarr; {data.valid_until}
            </div>
          </div>
          <button
            type="button"
            onClick={handleShare}
            title="Share Verification URL"
            className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition flex items-center gap-1 text-xs border border-surface-variant/40"
          >
            <span className="material-symbols-outlined text-base">share</span>
            <span className="hidden sm:inline font-medium">{shared ? "Link Copied!" : "Share"}</span>
          </button>
          <button
            type="button"
            onClick={handlePrint}
            title="Print Official Verification"
            className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition flex items-center gap-1 text-xs border border-surface-variant/40"
          >
            <span className="material-symbols-outlined text-base">print</span>
            <span className="hidden sm:inline font-medium">Print</span>
          </button>
        </div>
      </div>

      {/* Main Spec Grid */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
        <div className="p-3.5 rounded-lg bg-surface-container-low border border-surface-variant/30">
          <span className="text-outline uppercase font-semibold tracking-wider text-[10px]">
            Instrument Registration
          </span>
          <p className="font-mono font-bold text-sm text-secondary mt-1">
            {data.instrument_registration_number}
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-surface-container-low border border-surface-variant/30">
          <span className="text-outline uppercase font-semibold tracking-wider text-[10px]">
            Instrument Type & Category
          </span>
          <p className="font-semibold text-sm text-on-surface mt-1">
            {data.instrument_type?.replace(/_/g, " ")}
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-surface-container-low border border-surface-variant/30">
          <span className="text-outline uppercase font-semibold tracking-wider text-[10px]">
            Make & Model
          </span>
          <p className="font-semibold text-sm text-on-surface mt-1">
            {data.manufacturer} • {data.model}
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-surface-container-low border border-surface-variant/30">
          <span className="text-outline uppercase font-semibold tracking-wider text-[10px]">
            Serial Number
          </span>
          <p className="font-mono font-semibold text-sm text-on-surface mt-1">
            {data.serial_number || "Verified Physical Unit"}
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-surface-container-low border border-surface-variant/30">
          <span className="text-outline uppercase font-semibold tracking-wider text-[10px]">
            Testing Determination
          </span>
          <p className="font-bold text-sm text-tertiary mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-base">check_circle</span>
            {data.verification_result || "CONFORMS TO STANDARDS"}
          </p>
        </div>

        <div className="p-3.5 rounded-lg bg-surface-container-low border border-surface-variant/30">
          <span className="text-outline uppercase font-semibold tracking-wider text-[10px]">
            Digital Issue Timestamp
          </span>
          <p className="font-mono text-sm text-on-surface mt-1">
            {data.issued_at ? new Date(data.issued_at).toLocaleDateString() : "Active"}
          </p>
        </div>
      </div>

      {/* Cryptographic Proof Box */}
      <div className="px-6 pb-6">
        <div className="p-4 rounded-xl bg-primary-container text-inverse-on-surface">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs text-tertiary-fixed font-semibold">
              <span className="material-symbols-outlined text-base">lock</span>
              <span>SHA-256 Canonical Cryptographic Integrity Digest</span>
            </div>
            <button
              onClick={copyHash}
              className="px-2.5 py-1 rounded bg-surface-container-lowest/15 hover:bg-surface-container-lowest/25 text-[11px] text-on-secondary transition flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
              <span>{copied ? "Copied!" : "Copy Hash"}</span>
            </button>
          </div>
          <div className="font-mono text-[11px] break-all bg-black/30 p-2.5 rounded text-tertiary-fixed font-medium">
            {data.integrity_hash}
          </div>
          <p className="text-[10px] text-inverse-on-surface/60 mt-1.5">
            Guaranteed tamper-proof by METRIX. Generated deterministically from canonical verification records.
          </p>
        </div>
      </div>
    </div>
  );
}
