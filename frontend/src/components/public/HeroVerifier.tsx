"use client";

import React, { useState, useEffect } from "react";
import { VerificationResultCard, PublicCertData } from "./VerificationResultCard";
import { CameraScannerModal } from "./CameraScannerModal";

const SAMPLE_TOKENS = [
  { token: "METRIX-CERT-2026-000001", label: "Electronic Precision Balance" },
  { token: "METRIX-CERT-2025-084129", label: "Industrial Weighbridge (60t)" },
  { token: "METRIX-CERT-2026-000492", label: "Retail Fuel Dispenser Unit" },
];

export function HeroVerifier({ initialToken }: { initialToken?: string }) {
  const [mode, setMode] = useState<"token" | "qr">("token");
  const [tokenInput, setTokenInput] = useState(initialToken || "METRIX-CERT-2026-000001");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [certData, setCertData] = useState<PublicCertData | null>(null);

  const handleVerify = async (tokenToVerify?: string) => {
    const target = (tokenToVerify || tokenInput).trim();
    if (!target) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${apiUrl}/public/certificates/verify/${encodeURIComponent(target)}`);
      if (res.ok) {
        const data = await res.json();
        setCertData(data);
      } else if (res.status === 404) {
        setErrorMsg(`Certificate "${target}" was not found in the legal metrology registry.`);
        setCertData(null);
      } else {
        setErrorMsg("Failed to communicate with verification registry. Please try again.");
      }
    } catch {
      setErrorMsg("Network error connecting to verification service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialToken) {
      handleVerify(initialToken);
    }
  }, [initialToken]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* Sovereign Pill */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-surface-container-lowest border border-surface-variant/40 shadow-xs mb-4">
        <span className="material-symbols-outlined text-secondary text-base">
          verified_user
        </span>
        <span className="text-xs text-on-surface font-semibold tracking-wide">
          Public Instrument Authenticity Gateway
        </span>
        <span className="text-[10px] bg-surface-container px-2 py-0.5 rounded text-secondary font-bold">
          2026 ACT READY
        </span>
      </div>

      {/* Main Headline */}
      <h1 className="font-headline font-bold text-2xl sm:text-4xl text-on-surface max-w-3xl text-center tracking-tight leading-snug">
        Ensuring Fair Measure &amp; Consumer Trust Through Digital Verification
      </h1>

      <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl text-center mt-3 leading-relaxed">
        Instant cryptographic verification of commercial weighing and measuring instruments across India.
        Verify tamper-proof digital certificates and holographic security stamps in real time.
      </p>

      {/* Interactive Verification Master Module */}
      <div className="w-full max-w-3xl mt-8 bg-surface-container-lowest rounded-xl shadow-lg border border-surface-variant/50 overflow-hidden text-left">
        {/* Tab Switcher */}
        <div className="flex items-stretch bg-surface-container-low p-1.5 gap-1.5 border-b border-surface-variant/30">
          <button
            onClick={() => setMode("token")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all ${
              mode === "token"
                ? "bg-surface-container-lowest text-on-surface shadow-xs font-bold"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined text-base">pin</span>
            <span>Enter Certificate / Token</span>
          </button>
          <button
            onClick={() => setMode("qr")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold transition-all ${
              mode === "qr"
                ? "bg-surface-container-lowest text-on-surface shadow-xs font-bold"
                : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            }`}
          >
            <span className="material-symbols-outlined text-base">qr_code_scanner</span>
            <span>Scan Official Stamp QR</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-tertiary/10 text-tertiary rounded font-mono">
              Camera
            </span>
          </button>
        </div>

        {/* Tab Content */}
        {mode === "token" ? (
          <div className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="token-input"
                className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center justify-between"
              >
                <span>Instrument Verification Token or Certificate ID</span>
                <span className="text-[11px] font-normal text-on-surface-variant font-mono">
                  Format: METRIX-CERT-YYYY-XXXXXX
                </span>
              </label>

              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-outline">
                    <span className="material-symbols-outlined text-lg">shield_locked</span>
                  </span>
                  <input
                    id="token-input"
                    type="text"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    placeholder="e.g. METRIX-CERT-2026-000001 or URL token"
                    className="w-full h-11 pl-9 pr-4 bg-surface rounded-lg font-mono text-xs text-on-surface border border-surface-variant focus:outline-none focus:border-secondary transition"
                  />
                </div>
                <button
                  onClick={() => handleVerify()}
                  disabled={loading}
                  className="h-11 px-6 bg-primary hover:bg-primary-container text-on-primary rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition active:scale-95 shadow disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-base">
                    {loading ? "progress_activity" : "verified"}
                  </span>
                  <span>{loading ? "Verifying..." : "Verify Certificate"}</span>
                </button>
              </div>
            </div>

            {/* Quick Sample Tokens */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-surface-variant/30">
              <span className="text-[11px] text-outline uppercase font-semibold">
                Sample Tokens:
              </span>
              {SAMPLE_TOKENS.map((item) => (
                <button
                  key={item.token}
                  onClick={() => {
                    setTokenInput(item.token);
                    handleVerify(item.token);
                  }}
                  className="font-mono text-[11px] px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-secondary transition font-medium"
                >
                  {item.token}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <CameraScannerModal
            onScan={(token) => {
              setTokenInput(token);
              setMode("token");
              handleVerify(token);
            }}
          />
        )}
      </div>

      {/* Verified Certificate Result Output */}
      {certData && (
        <div className="w-full max-w-3xl mt-8">
          <VerificationResultCard data={certData} />
        </div>
      )}
    </div>
  );
}
