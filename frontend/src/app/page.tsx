"use client";

import React from "react";
import Link from "next/link";
import { HeroVerifier } from "@/components/public/HeroVerifier";

export default function HomePage() {
  return (
    <div className="space-y-12 py-4">
      {/* Hero Verifier Section */}
      <section className="relative">
        <HeroVerifier />
      </section>

      {/* Live Sovereign Ledger Statistics Bar */}
      <section className="w-full bg-surface-container-lowest rounded-xl border border-surface-variant/50 p-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-3">
            <span className="text-[11px] text-outline uppercase font-semibold">
              Total Verified Instruments
            </span>
            <div className="font-headline font-bold text-2xl sm:text-3xl text-on-surface mt-1">
              248,910
            </div>
            <span className="text-[11px] text-tertiary font-medium">
              +1,240 this month
            </span>
          </div>

          <div className="p-3 border-l border-surface-variant/40">
            <span className="text-[11px] text-outline uppercase font-semibold">
              Active Digital Certificates
            </span>
            <div className="font-headline font-bold text-2xl sm:text-3xl text-on-surface mt-1">
              214,500
            </div>
            <span className="text-[11px] text-secondary font-medium">
              QR Sealed &amp; Valid
            </span>
          </div>

          <div className="p-3 border-l border-surface-variant/40">
            <span className="text-[11px] text-outline uppercase font-semibold">
              Statutory Compliance
            </span>
            <div className="font-headline font-bold text-2xl sm:text-3xl text-tertiary mt-1">
              99.4%
            </div>
            <span className="text-[11px] text-on-surface-variant">
              Across All Circles
            </span>
          </div>

          <div className="p-3 border-l border-surface-variant/40">
            <span className="text-[11px] text-outline uppercase font-semibold">
              Avg Verification Turnaround
            </span>
            <div className="font-headline font-bold text-2xl sm:text-3xl text-on-surface mt-1">
              &lt; 48 hrs
            </div>
            <span className="text-[11px] text-secondary font-medium">
              Direct Officer SLA
            </span>
          </div>
        </div>
      </section>

      {/* Legal Metrology Statutory Framework Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline font-bold text-lg text-on-surface">
              Statutory Enforcement Framework
            </h2>
            <p className="text-xs text-on-surface-variant">
              Legal Metrology Act, 2009 &amp; General Rules enforcement mandate.
            </p>
          </div>
          <span className="text-xs font-semibold text-secondary">
            Gazette Standard
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 bg-surface-container-lowest rounded-xl border border-surface-variant/40 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-surface-container text-secondary flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-xl">event_repeat</span>
              </div>
              <h3 className="font-bold text-sm text-on-surface">
                Section 24: Periodic Re-verification
              </h3>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                Every commercial measuring instrument must undergo statutory verification
                annually or biennially. Certificates expire automatically if not renewed.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-surface-variant/30 text-[11px] text-secondary font-semibold">
              Automated 30-Day Expiry Notice
            </div>
          </div>

          <div className="p-5 bg-surface-container-lowest rounded-xl border border-surface-variant/40 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-surface-container text-secondary flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-xl">security</span>
              </div>
              <h3 className="font-bold text-sm text-on-surface">
                Section 30: Anti-Tamper Security Seals
              </h3>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                Verification stamp seals embed SHA-256 cryptographic verification hashes
                preventing unauthorized hardware alteration or weight manipulation.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-surface-variant/30 text-[11px] text-tertiary font-semibold">
              Cryptographically Signed QR Proof
            </div>
          </div>

          <div className="p-5 bg-surface-container-lowest rounded-xl border border-surface-variant/40 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-9 h-9 rounded-lg bg-surface-container text-secondary flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-xl">gavel</span>
              </div>
              <h3 className="font-bold text-sm text-on-surface">
                Section 38: Fair Measure Protection
              </h3>
              <p className="text-xs text-on-surface-variant mt-2 leading-relaxed">
                Empowering citizens and consumers to scan any physical weighing device in
                retail shops, petrol pumps, or markets to confirm active certification.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-surface-variant/30 text-[11px] text-secondary font-semibold">
              Direct Consumer Grievance Link
            </div>
          </div>
        </div>
      </section>

      {/* Stakeholder Action Banner */}
      <section className="bg-gradient-to-r from-primary-container via-inverse-surface to-primary-container rounded-xl p-8 text-on-secondary shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-tertiary-fixed bg-tertiary-container px-2.5 py-0.5 rounded-full">
            Authorized Portal Access
          </span>
          <h2 className="font-headline font-bold text-xl sm:text-2xl text-on-secondary mt-2">
            Are you a Legal Metrology Officer or Business Owner?
          </h2>
          <p className="text-xs sm:text-sm text-inverse-on-surface/80 mt-1 max-w-xl">
            Sign in to process verification applications, schedule field inspections,
            log calibration testing observations, and generate digital certificates.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/login"
            className="px-5 py-2.5 rounded-lg bg-secondary hover:bg-secondary-container text-on-secondary font-semibold text-xs transition shadow-md flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-base">login</span>
            <span>Sign In to Portal</span>
          </Link>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-lg bg-surface-container-lowest/15 hover:bg-surface-container-lowest/25 text-on-secondary font-semibold text-xs transition shadow-sm"
          >
            Go to Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
