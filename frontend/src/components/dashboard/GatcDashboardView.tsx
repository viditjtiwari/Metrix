"use client";

import React from "react";
import Link from "next/link";

interface GatcProps {
  metrics?: {
    assigned_inspections?: number;
    scheduled_inspections?: number;
    inspections_in_progress?: number;
    completed_inspections?: number;
    verification_results?: number;
  };
}

export function GatcDashboardView({ metrics }: GatcProps) {
  const assignedCount = metrics?.assigned_inspections ?? 0;
  const inProgress = metrics?.inspections_in_progress ?? 0;
  const completed = metrics?.completed_inspections ?? 0;
  const resultsCount = metrics?.verification_results ?? 0;

  const mockCalibrationBench = [
    {
      id: "CAL-2026-901",
      device: "Analytical Micro-Balance (0.01mg precision)",
      client: "Cipla Pharmaceuticals Quality Lab",
      parameter: "Repeatability & Corner Load Tolerance",
      status: "IN_TESTING",
    },
    {
      id: "CAL-2026-894",
      device: "Electromagnetic Fuel Dispenser Sensor",
      client: "Bharat Petroleum Terminal No. 6",
      parameter: "Flow Rate Volumetric Deviation (±0.05%)",
      status: "SCHEDULED",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* GATC Greeting Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary-container via-inverse-surface to-primary-container text-on-secondary p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-surface-container-lowest/10 backdrop-blur flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-tertiary-fixed text-3xl">
                biotech
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="font-headline font-bold text-xl text-on-secondary">
                  National Calibration Laboratory
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-tertiary-container text-tertiary-fixed text-[10px] font-bold uppercase">
                  Accredited Test Centre (GATC)
                </span>
              </div>
              <p className="text-xs text-inverse-on-surface/80 flex items-center gap-2 flex-wrap">
                <span>License: <code className="text-tertiary-fixed font-mono">GATC-LIC-DEL-2026</code></span>
                <span>•</span>
                <span>Premises: <strong>Okhla Industrial Area Phase 1, New Delhi</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/applications"
              className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary-container text-on-secondary font-semibold text-xs transition shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">fact_check</span>
              <span>Open Testing Console</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-variant/50 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-outline uppercase text-[11px] font-semibold tracking-wider">
                Assigned Lab Tests
              </span>
              <div className="font-headline font-bold text-2xl text-on-surface mt-1">
                {assignedCount}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">assignment</span>
            </div>
          </div>
          <span className="text-[11px] text-secondary font-semibold mt-3">
            In queue for test observation
          </span>
        </div>

        <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-variant/50 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-outline uppercase text-[11px] font-semibold tracking-wider">
                Active Calibration Bench
              </span>
              <div className="font-headline font-bold text-2xl text-secondary mt-1">
                {inProgress}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">science</span>
            </div>
          </div>
          <span className="text-[11px] text-secondary font-semibold mt-3">
            Measurements being logged
          </span>
        </div>

        <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-variant/50 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-outline uppercase text-[11px] font-semibold tracking-wider">
                Tests Completed
              </span>
              <div className="font-headline font-bold text-2xl text-tertiary mt-1">
                {completed}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-tertiary-container text-tertiary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">check_circle</span>
            </div>
          </div>
          <span className="text-[11px] text-tertiary font-semibold mt-3">
            Tolerance verified conforming
          </span>
        </div>

        <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-variant/50 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-outline uppercase text-[11px] font-semibold tracking-wider">
                Reports Forwarded to LMO
              </span>
              <div className="font-headline font-bold text-2xl text-on-surface mt-1">
                {resultsCount}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">send</span>
            </div>
          </div>
          <span className="text-[11px] text-outline font-medium mt-3">
            Awaiting final digital certificate
          </span>
        </div>
      </div>

      {/* Active Bench Queue */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-variant/50 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-variant/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">biotech</span>
            <h3 className="font-bold text-sm text-on-surface">
              Active Instrument Calibration Queue
            </h3>
          </div>
          <span className="text-xs text-outline font-mono">ISO/IEC 17025 Compliant</span>
        </div>

        <div className="divide-y divide-surface-variant/30 text-xs">
          {mockCalibrationBench.map((bench) => (
            <div
              key={bench.id}
              className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container-low transition"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-on-surface">{bench.id}</span>
                  <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-900">
                    {bench.status}
                  </span>
                </div>
                <p className="font-semibold text-on-surface mt-0.5">{bench.device}</p>
                <p className="text-on-surface-variant text-[11px]">
                  Client: {bench.client} • Parameter: {bench.parameter}
                </p>
              </div>

              <Link
                href="/applications"
                className="px-3.5 py-1.5 rounded-lg bg-secondary hover:bg-secondary-container text-on-secondary font-semibold text-xs transition shadow-xs self-end sm:self-center"
              >
                Log Test Parameters
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
