"use client";

import React from "react";
import Link from "next/link";

interface OwnerProps {
  metrics?: {
    total_instruments?: number;
    total_applications?: number;
    pending_applications?: number;
    scheduled_inspections?: number;
    verified_applications?: number;
    rejected_applications?: number;
    active_certificates?: number;
    expired_certificates?: number;
  };
}

export function OwnerDashboardView({ metrics }: OwnerProps) {
  const totalInstruments = metrics?.total_instruments ?? 0;
  const activeCerts = metrics?.active_certificates ?? 0;
  const pendingApps = metrics?.pending_applications ?? 0;
  const expiredCerts = metrics?.expired_certificates ?? 0;

  const sampleFleet = [
    {
      reg: "INST-2026-MH-4912",
      type: "ELECTRONIC_BALANCE",
      model: "Avery Weigh-Tronix Class II",
      location: "Warehouse Bay 4, Hinjewadi, Pune",
      validUntil: "2027-02-14",
      status: "ACTIVE",
    },
    {
      reg: "INST-2025-MH-1029",
      type: "WEIGHING_SCALE",
      model: "Heavy Platform Scale (500kg)",
      location: "Loading Dock 1, Pune",
      validUntil: "2026-10-10",
      status: "EXPIRING_SOON",
    },
    {
      reg: "INST-2024-MH-0842",
      type: "FLOW_METER",
      model: "Liquid Turbine Meter",
      location: "Tanker Depot, Pune",
      validUntil: "2026-08-01",
      status: "EXPIRED",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Enterprise Owner Greeting Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary-container via-inverse-surface to-primary-container text-on-secondary p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-surface-container-lowest/10 backdrop-blur flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-tertiary-fixed text-3xl">
                storefront
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="font-headline font-bold text-xl text-on-secondary">
                  Mittal Logistics &amp; Warehouse Pvt Ltd
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-secondary text-on-secondary text-[10px] font-bold uppercase">
                  Enterprise Owner
                </span>
              </div>
              <p className="text-xs text-inverse-on-surface/80 flex items-center gap-2 flex-wrap">
                <span>Trade License: <code className="text-tertiary-fixed font-mono">TLN-MH-2024-9988</code></span>
                <span>•</span>
                <span>Facility: <strong>Plot 42, MIDC Hinjewadi, Pune</strong></span>
                <span>•</span>
                <span className="text-tertiary-fixed">{totalInstruments} Commercial Instruments Registered</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/applications"
              className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary-container text-on-secondary font-semibold text-xs transition shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span>Apply for Verification</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-variant/50 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-outline uppercase text-[11px] font-semibold tracking-wider">
                Total Fleet Instruments
              </span>
              <div className="font-headline font-bold text-2xl text-on-surface mt-1">
                {totalInstruments}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">scale</span>
            </div>
          </div>
          <span className="text-[11px] text-secondary font-semibold mt-3">
            Registered Under Trade License
          </span>
        </div>

        <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-variant/50 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-outline uppercase text-[11px] font-semibold tracking-wider">
                Active Certified Devices
              </span>
              <div className="font-headline font-bold text-2xl text-tertiary mt-1">
                {activeCerts}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-tertiary-container text-tertiary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">verified</span>
            </div>
          </div>
          <span className="text-[11px] text-tertiary font-semibold mt-3">
            Legally Certified &amp; Stamped
          </span>
        </div>

        <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-variant/50 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-outline uppercase text-[11px] font-semibold tracking-wider">
                Applications In-Progress
              </span>
              <div className="font-headline font-bold text-2xl text-secondary mt-1">
                {pendingApps}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">assignment</span>
            </div>
          </div>
          <span className="text-[11px] text-secondary font-semibold mt-3">
            Awaiting LMO Inspection
          </span>
        </div>

        <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-variant/50 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-outline uppercase text-[11px] font-semibold tracking-wider">
                Renewal Required
              </span>
              <div className="font-headline font-bold text-2xl text-error mt-1">
                {expiredCerts}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-error-container/40 text-on-error-container flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">warning</span>
            </div>
          </div>
          <span className="text-[11px] text-error font-semibold mt-3 flex items-center gap-1">
            <span className="material-symbols-outlined text-xs">notification_important</span>
            Action needed within 30 days
          </span>
        </div>
      </div>

      {/* Commercial Fleet Inventory Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-variant/50 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-variant/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">inventory_2</span>
            <h3 className="font-bold text-sm text-on-surface">
              My Commercial Measuring Instruments
            </h3>
          </div>
          <Link
            href="/applications"
            className="text-xs font-semibold text-secondary hover:underline"
          >
            Apply for Re-verification &rarr;
          </Link>
        </div>

        <div className="divide-y divide-surface-variant/30 text-xs">
          {sampleFleet.map((item) => (
            <div
              key={item.reg}
              className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container-low transition"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-on-surface">{item.reg}</span>
                  <span
                    className={`px-2 py-0.2 rounded text-[10px] font-bold uppercase ${
                      item.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-800"
                        : item.status === "EXPIRING_SOON"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {item.status.replace("_", " ")}
                  </span>
                </div>
                <p className="font-semibold text-on-surface mt-0.5">{item.model}</p>
                <p className="text-on-surface-variant text-[11px]">{item.location}</p>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                <div className="text-right">
                  <span className="text-[10px] text-outline uppercase font-semibold">
                    Valid Until
                  </span>
                  <p className="font-mono font-bold text-on-surface">{item.validUntil}</p>
                </div>
                <Link
                  href="/applications"
                  className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-secondary text-xs font-semibold transition"
                >
                  Renew
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
