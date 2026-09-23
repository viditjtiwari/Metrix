"use client";

import React, { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Camera, Search, Shield, AlertTriangle } from "lucide-react";
import { PublicCertificateVerificationResponse } from "@/types";
import { CameraQrScanner } from "@/features/verification/CameraQrScanner";
import { CertificateResultCard } from "@/features/verification/CertificateResultCard";
import { GlobalTopNav } from "@/components/layout/GlobalTopNav";
import { GlobalFooter } from "@/components/layout/GlobalFooter";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

type TabMode = "scan" | "number";

export default function VerifyLookupPage() {
  const router = useRouter();
  const [mode, setMode] = useState<TabMode>("number");
  const [certNumber, setCertNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cert, setCert] = useState<PublicCertificateVerificationResponse | null>(null);

  /* ─── Manual Lookup ─── */
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certNumber.trim()) return;
    setLoading(true);
    setError(null);
    setCert(null);
    try {
      const res = await fetch(
        `${API_BASE}/public/certificates/lookup/${encodeURIComponent(certNumber.trim())}`
      );
      if (!res.ok) {
        if (res.status === 404)
          throw new Error("No certificate found matching this number.");
        throw new Error("Verification service unavailable. Please try again.");
      }
      setCert(await res.json());
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  /* ─── QR Scan Result Handler ─── */
  const handleQrResult = useCallback(
    async (scannedText: string) => {
      const verifyMatch = scannedText.match(/\/verify\/([A-Za-z0-9_-]+)/);
      if (verifyMatch) {
        router.push(`/verify/${verifyMatch[1]}`);
        return;
      }

      setMode("number");
      setCertNumber(scannedText);
      setLoading(true);
      setError(null);
      setCert(null);
      try {
        let res = await fetch(
          `${API_BASE}/public/certificates/verify/${encodeURIComponent(scannedText)}`
        );
        if (!res.ok) {
          res = await fetch(
            `${API_BASE}/public/certificates/lookup/${encodeURIComponent(scannedText)}`
          );
        }
        if (!res.ok) {
          throw new Error("No certificate found for the scanned QR code.");
        }
        setCert(await res.json());
      } catch (err: unknown) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <GlobalTopNav />
      <main className="flex-1 py-10 px-4 sm:px-6 flex flex-col items-center">
        {/* Header */}
        <div className="w-full max-w-xl text-center mb-6">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-emerald-600 text-white font-bold text-xl shadow-md mb-3">
            M
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Certificate Verification Portal
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Verify the authenticity of any METRIX statutory digital certificate
          </p>
        </div>


      {/* Main Card */}
      <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Tab Toggle */}
        <div className="flex border-b border-slate-200 bg-slate-50/50">
          <button
            type="button"
            onClick={() => {
              setMode("number");
              setError(null);
            }}
            className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition ${
              mode === "number"
                ? "border-emerald-600 text-emerald-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Search size={15} />
            Certificate Number
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("scan");
              setError(null);
            }}
            className={`flex-1 py-3 px-4 text-xs font-semibold flex items-center justify-center gap-2 border-b-2 transition ${
              mode === "scan"
                ? "border-emerald-600 text-emerald-700 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            <Camera size={15} />
            Scan QR Code
          </button>
        </div>

        {/* Tab Content */}
        {mode === "scan" ? (
          <CameraQrScanner onResult={handleQrResult} />
        ) : (
          <div className="p-6">
            <form onSubmit={handleLookup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Certificate Number
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={certNumber}
                    onChange={(e) => setCertNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. METRIX-CERT-2026-000001"
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow-sm disabled:opacity-50 transition flex items-center gap-2"
                  >
                    {loading ? (
                      <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <Shield size={16} />
                    )}
                    Verify
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Enter the certificate number printed on the official METRIX certificate document.
              </p>
            </form>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mx-6 mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-center">
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-rose-100 text-rose-600 mb-2">
              <AlertTriangle size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Verification Failed</h3>
            <p className="text-xs text-rose-600 mt-1">{error}</p>
          </div>
        )}

        {/* Certificate Result */}
        {cert && (
          <CertificateResultCard
            cert={cert}
            onClear={() => {
              setCert(null);
              setCertNumber("");
            }}
          />
        )}
      </div>

      {/* Back Link */}
      <div className="mt-6 text-center">
        <Link
          href="/"
          className="text-xs font-semibold text-slate-500 hover:text-emerald-700 transition"
        >
          ← Return to METRIX Home
        </Link>
      </div>
      </main>
      <GlobalFooter />
    </div>
  );
}

