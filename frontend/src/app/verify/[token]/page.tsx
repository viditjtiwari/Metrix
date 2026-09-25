"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PublicCertificateVerificationResponse } from "@/types";
import { GlobalTopNav } from "@/components/layout/GlobalTopNav";
import { GlobalFooter } from "@/components/layout/GlobalFooter";
import { DiscrepancyReportModal } from "@/features/verify/DiscrepancyReportModal";

export default function PublicVerifyPage() {
  const params = useParams();
  const token = params?.token as string;

  const [cert, setCert] = useState<PublicCertificateVerificationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    if (!token) return;

    const fetchVerification = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
        const res = await fetch(`${apiUrl}/public/certificates/verify/${encodeURIComponent(token)}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error("This verification token does not match any certificate in the METRIX registry.");
          }
          throw new Error("Unable to verify certificate at this time. Please try again later.");
        }
        const data = await res.json();
        setCert(data);
      } catch (err: unknown) {
        setError((err as Error).message || "Verification failed");
      } finally {
        setLoading(false);
      }
    };

    fetchVerification();
  }, [token]);

  const isExpired = cert?.status === "EXPIRED";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <GlobalTopNav />
      <main className="flex-1 py-10 px-4 sm:px-6 flex flex-col items-center">
        {/* Header Emblem */}
        <div className="w-full max-w-xl text-center mb-8">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-600 text-white font-bold text-xl shadow-md mb-3">
            M
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">METRIX Public Registry</h1>
          <p className="text-xs text-slate-500 mt-1">
            Government Legal Metrology Statutory Instrument Verification System
          </p>
        </div>


      <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 text-xs">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent"></div>
            <p className="text-xs text-slate-500 font-medium">Verifying certificate authenticity...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center space-y-4">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-rose-100 text-rose-600 text-2xl font-bold">
              ✕
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Certificate Verification Failed</h2>
              <p className="text-xs text-rose-600 mt-1">{error}</p>
            </div>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto">
              Please inspect the QR code or link you received. Ensure the URL has not been tampered with or truncated.
            </p>
          </div>
        ) : cert ? (
          <div className="space-y-6">
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
                    ? `Validity expired on ${cert.valid_until}. Instrument requires statutory re-verification.`
                    : "This instrument is currently active and certified under the Legal Metrology Act."}
                </p>
              </div>
            </div>

            {/* Certificate Header Info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <span className="text-slate-400 block text-[11px]">Certificate Number</span>
                <span className="font-mono font-bold text-sm text-slate-900">{cert.certificate_number}</span>
              </div>
              <div>
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
            </div>

            {/* Instrument Particulars */}
            <div>
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Instrument Details
              </h3>
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[11px]">Registration No.</span>
                  <span className="font-semibold text-slate-800 font-mono">{cert.instrument_registration_number}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Instrument Type</span>
                  <span className="font-semibold text-slate-800">{cert.instrument_type}</span>
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

            {/* Statutory Validity Dates */}
            <div>
              <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
                Statutory Validity
              </h3>
              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
                <div>
                  <span className="text-slate-400 block text-[11px]">Issue Date</span>
                  <span className="font-medium text-slate-800">{new Date(cert.issued_at).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Valid From</span>
                  <span className="font-medium text-slate-800">{cert.valid_from}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Valid Until</span>
                  <span className={`font-semibold ${isExpired ? "text-rose-600" : "text-emerald-700"}`}>
                    {cert.valid_until}
                  </span>
                </div>
              </div>
            </div>

            {/* Anti-Tamper Integrity Box */}
            <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl space-y-1">
              <span className="text-[10px] text-slate-400 font-mono block">
                SHA-256 INTEGRITY HASH (TAMPER-EVIDENT RECORD)
              </span>
              <p className="font-mono text-[10px] text-emerald-400 break-all leading-tight">
                {cert.integrity_hash}
              </p>
            </div>

            {/* Whistleblower / Anti-Tamper Report Action */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
              >
                ⚠️ Report Suspicious or Tampered Certificate
              </button>
            </div>
          </div>
        ) : null}

        <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Official METRIX SIH26036 Portal</span>
          <Link href="/login" className="text-emerald-600 hover:underline font-medium">
            Authorized Sign In →
          </Link>
        </div>
      </div>

      {showReportModal && cert && (
        <DiscrepancyReportModal
          token={token}
          certificateNumber={cert.certificate_number}
          onClose={() => setShowReportModal(false)}
        />
      )}
      </main>
      <GlobalFooter />
    </div>
  );
}

