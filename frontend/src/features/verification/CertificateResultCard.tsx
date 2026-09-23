"use client";

import React from "react";
import Link from "next/link";
import { Shield } from "lucide-react";
import { PublicCertificateVerificationResponse } from "@/types";

interface Props {
  cert: PublicCertificateVerificationResponse;
  onClear: () => void;
}

export function CertificateResultCard({ cert, onClear }: Props) {
  const isExpired = cert.status === "EXPIRED";

  return (
    <div className="p-6 border-t border-slate-100 space-y-5">
      {/* Status Banner */}
      <div
        className={`p-4 rounded-xl border flex items-center gap-3 ${
          isExpired
            ? "bg-amber-50 border-amber-200 text-amber-900"
            : "bg-emerald-50 border-emerald-200 text-emerald-950"
        }`}
      >
        <div
          className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${
            isExpired ? "bg-amber-500 text-white" : "bg-emerald-600 text-white"
          }`}
        >
          {isExpired ? "!" : "✓"}
        </div>
        <div>
          <h2 className="text-sm font-bold">
            {isExpired ? "Certificate Expired" : "Authentic Certificate Verified"}
          </h2>
          <p className="text-[11px] opacity-80 mt-0.5">
            {isExpired
              ? `Validity expired on ${cert.valid_until}. Instrument requires re-verification.`
              : "This instrument is currently certified under the Legal Metrology Act."}
          </p>
        </div>
      </div>

      {/* Certificate Number + Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <span className="text-slate-400 block text-[11px]">Certificate Number</span>
          <span className="font-mono font-bold text-sm text-slate-900">
            {cert.certificate_number}
          </span>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
            isExpired
              ? "bg-amber-100 text-amber-800 border-amber-300"
              : "bg-emerald-100 text-emerald-800 border-emerald-300"
          }`}
        >
          ● {cert.status}
        </span>
      </div>

      {/* Instrument Details */}
      <div>
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          Instrument Details
        </h3>
        <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Registration No.</span>
            <span className="font-semibold text-slate-800 font-mono">
              {cert.instrument_registration_number}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Instrument Type</span>
            <span className="font-semibold text-slate-800">
              {cert.instrument_type.replace(/_/g, " ")}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Manufacturer</span>
            <span className="font-semibold text-slate-800">{cert.manufacturer}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Model / Serial</span>
            <span className="font-semibold text-slate-800 font-mono">
              {cert.model} {cert.serial_number ? `(${cert.serial_number})` : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Validity Dates */}
      <div>
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
          Statutory Validity
        </h3>
        <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-center text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Issue Date</span>
            <span className="font-medium text-slate-800">
              {new Date(cert.issued_at).toLocaleDateString()}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Valid From</span>
            <span className="font-medium text-slate-800">{cert.valid_from}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Valid Until</span>
            <span
              className={`font-semibold ${isExpired ? "text-rose-600" : "text-emerald-700"}`}
            >
              {cert.valid_until}
            </span>
          </div>
        </div>
      </div>

      {/* Cryptographic Verification Hash */}
      <div>
        <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
          <Shield size={12} className="text-emerald-600" />
          SHA-256 Anti-Tamper Digest
        </h3>
        <div className="p-3 bg-slate-900 rounded-xl font-mono text-[10px] text-emerald-400 break-all border border-slate-800">
          {cert.integrity_hash}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={onClear}
          className="flex-1 py-2 px-3 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
        >
          Verify Another
        </button>
        <Link
          href="/"
          className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold text-center transition"
        >
          Done
        </Link>
      </div>
    </div>
  );
}
