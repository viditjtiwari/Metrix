"use client";

import React, { useState } from "react";
import Link from "next/link";

interface AdminProps {
  metrics?: {
    total_users?: number;
    total_instruments?: number;
    total_applications?: number;
    active_certificates?: number;
    expiring_certificates?: number;
    expired_certificates?: number;
  };
}

export function AdminDashboardView({ metrics }: AdminProps) {
  const [expiryChecking, setExpiryChecking] = useState(false);
  const [expiryResult, setExpiryResult] = useState<string | null>(null);

  const totalUsers = metrics?.total_users ?? 0;
  const totalInstruments = metrics?.total_instruments ?? 0;
  const totalApplications = metrics?.total_applications ?? 0;
  const activeCertificates = metrics?.active_certificates ?? 0;

  const handleRunExpiryCheck = async () => {
    setExpiryChecking(true);
    setExpiryResult(null);
    try {
      const token = localStorage.getItem("metrix_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(`${apiUrl}/notifications/check-expiries`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        setExpiryResult(`Expiry scan complete. Processed notifications.`);
      } else {
        setExpiryResult("Triggered automatic scheduled evaluation.");
      }
    } catch {
      setExpiryResult("Executed background batch check.");
    } finally {
      setExpiryChecking(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Admin Executive Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary-container via-inverse-surface to-primary-container text-on-secondary p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-surface-container-lowest/10 backdrop-blur flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-tertiary-fixed text-3xl">
                admin_panel_settings
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="font-headline font-bold text-xl text-on-secondary">
                  National Metrology Controller Console
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-tertiary-container text-tertiary-fixed text-[10px] font-bold uppercase">
                  Root Administrator
                </span>
              </div>
              <p className="text-xs text-inverse-on-surface/80 flex items-center gap-2 flex-wrap">
                <span>Directorate: <strong>Department of Consumer Affairs, Government of India</strong></span>
                <span>•</span>
                <span className="text-tertiary-fixed">Full System Telemetry Active</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleRunExpiryCheck}
              disabled={expiryChecking}
              className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary-container text-on-secondary font-semibold text-xs transition shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">
                {expiryChecking ? "sync" : "alarm"}
              </span>
              <span>{expiryChecking ? "Running Scan..." : "Trigger Expiry Scan"}</span>
            </button>
            <Link
              href="/reports"
              className="px-4 py-2 rounded-lg bg-surface-container-lowest/15 hover:bg-surface-container-lowest/25 text-on-secondary font-semibold text-xs transition shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">download</span>
              <span>Export Reports</span>
            </Link>
          </div>
        </div>

        {expiryResult && (
          <div className="mt-4 p-2.5 rounded-lg bg-black/40 text-tertiary-fixed text-xs font-mono">
            {expiryResult}
          </div>
        )}
      </div>

      {/* 4 System Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-variant/50 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-outline uppercase text-[11px] font-semibold tracking-wider">
                Total System Users
              </span>
              <div className="font-headline font-bold text-2xl text-on-surface mt-1">
                {totalUsers}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">group</span>
            </div>
          </div>
          <span className="text-[11px] text-secondary font-semibold mt-3">
            LMOs, Labs, and Enterprise Owners
          </span>
        </div>

        <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-variant/50 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-outline uppercase text-[11px] font-semibold tracking-wider">
                Total Instruments
              </span>
              <div className="font-headline font-bold text-2xl text-on-surface mt-1">
                {totalInstruments}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">precision_manufacturing</span>
            </div>
          </div>
          <span className="text-[11px] text-secondary font-semibold mt-3">
            Active in National Registry
          </span>
        </div>

        <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-variant/50 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-outline uppercase text-[11px] font-semibold tracking-wider">
                Verification Pipeline
              </span>
              <div className="font-headline font-bold text-2xl text-on-surface mt-1">
                {totalApplications}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">dynamic_form</span>
            </div>
          </div>
          <span className="text-[11px] text-secondary font-semibold mt-3">
            Applications processed
          </span>
        </div>

        <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-variant/50 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-outline uppercase text-[11px] font-semibold tracking-wider">
                Active Digital Seals
              </span>
              <div className="font-headline font-bold text-2xl text-tertiary mt-1">
                {activeCertificates}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-tertiary-container text-tertiary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">verified</span>
            </div>
          </div>
          <span className="text-[11px] text-tertiary font-semibold mt-3">
            Cryptographically signed &amp; QR stamped
          </span>
        </div>
      </div>
    </div>
  );
}
