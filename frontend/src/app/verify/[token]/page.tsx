"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { PublicCertificateVerificationResponse } from "@/types";
import { VerificationResultCard } from "@/components/public/VerificationResultCard";
import { Button } from "@/components/ui/Button";

export default function PublicVerifyPage() {
  const params = useParams();
  const token = params?.token as string;

  const [cert, setCert] = useState<PublicCertificateVerificationResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="py-6 flex flex-col items-center max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header Emblem */}
      <div className="w-full text-center">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-primary text-on-primary font-bold text-xl shadow-md mb-3">
          <span className="material-symbols-outlined text-2xl">balance</span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-on-surface">
          METRIX Public Verification Registry
        </h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Directorate of Legal Metrology • Anti-Tamper Digital Certification
        </p>
      </div>

      {loading ? (
        <div className="w-full max-w-xl bg-surface-container-lowest rounded-2xl border border-surface-variant/40 p-12 text-center space-y-3 shadow-sm">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-tertiary border-t-transparent" />
          <p className="text-xs text-on-surface-variant font-medium">
            Verifying certificate authenticity against statutory ledger...
          </p>
        </div>
      ) : error ? (
        <div className="w-full max-w-xl bg-surface-container-lowest rounded-2xl border border-surface-variant/40 p-8 text-center space-y-4 shadow-sm">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-error-container text-on-error-container text-2xl font-bold">
            <span className="material-symbols-outlined text-3xl text-error">gpp_bad</span>
          </div>
          <div>
            <h2 className="text-base font-bold text-on-surface">
              Certificate Verification Failed
            </h2>
            <p className="text-xs text-error mt-1">{error}</p>
          </div>
          <p className="text-[11px] text-outline max-w-md mx-auto">
            Please verify the token or scan the official QR code again. If this
            instrument was recently verified, allow a few moments for ledger
            synchronization.
          </p>
          <div className="pt-2">
            <Link href="/verify">
              <Button variant="outline" size="sm">
                Return to Verifier Search
              </Button>
            </Link>
          </div>
        </div>
      ) : cert ? (
        <div className="w-full space-y-4">
          <VerificationResultCard
            data={{
              certificate_number: cert.certificate_number,
              instrument_registration_number: cert.instrument_registration_number,
              instrument_type: cert.instrument_type,
              manufacturer: cert.manufacturer,
              model: cert.model,
              serial_number: cert.serial_number,
              verification_result: cert.verification_result,
              issued_at: cert.issued_at,
              valid_from: cert.valid_from,
              valid_until: cert.valid_until,
              status: cert.status,
              integrity_hash: cert.integrity_hash,
            }}
          />

          <div className="flex items-center justify-between text-xs text-on-surface-variant px-2">
            <Link
              href="/verify"
              className="text-secondary hover:underline font-semibold flex items-center gap-1"
            >
              <span>← Verify Another Instrument</span>
            </Link>
            <span className="font-mono text-[11px] text-outline">
              Ledger Anchor: SHA-256 Validated
            </span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
