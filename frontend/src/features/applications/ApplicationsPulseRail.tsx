"use client";

import React from "react";

export function ApplicationsPulseRail() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-variant/40 shadow-xs flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold text-outline uppercase tracking-wider">
            Active Scrutiny Queue
          </div>
          <div className="font-headline font-bold text-xl text-on-surface mt-0.5">
            24 <span className="text-xs text-secondary font-semibold">Priority</span>
          </div>
          <div className="text-[11px] text-on-surface-variant mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            <span>Statutory Verification SLA</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary">
          <span className="material-symbols-outlined text-xl">pending_actions</span>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-variant/40 shadow-xs flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold text-outline uppercase tracking-wider">
            Scheduled Lab Tests
          </div>
          <div className="font-headline font-bold text-xl text-on-surface mt-0.5">
            9 <span className="text-xs text-secondary font-medium">GATC Units</span>
          </div>
          <div className="text-[11px] text-on-surface-variant mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
            <span>NABL Calibrated Test Rigs</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-tertiary">
          <span className="material-symbols-outlined text-xl">science</span>
        </div>
      </div>

      <div className="bg-surface-container-lowest p-4 rounded-xl border border-surface-variant/40 shadow-xs flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold text-outline uppercase tracking-wider">
            Verification Velocity
          </div>
          <div className="font-headline font-bold text-xl text-on-surface mt-0.5">
            96.4%
          </div>
          <div className="text-[11px] text-tertiary font-semibold flex items-center gap-0.5 mt-1">
            <span className="material-symbols-outlined text-xs">trending_up</span>
            <span>+3.2% vs last cycle</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-secondary">
          <span className="material-symbols-outlined text-xl">speed</span>
        </div>
      </div>

      <div className="bg-primary-container text-on-secondary p-4 rounded-xl border border-surface-variant/40 shadow-xs flex items-center justify-between relative overflow-hidden">
        <div>
          <div className="text-[10px] font-semibold text-tertiary-fixed uppercase tracking-wider">
            Digital Stamping Ledger
          </div>
          <div className="font-headline font-bold text-xl text-on-secondary mt-0.5">
            1,402 <span className="text-xs text-tertiary-fixed font-mono font-bold">ISSUED</span>
          </div>
          <div className="text-[11px] text-surface-container-high mt-1 flex items-center gap-1 font-mono">
            <span className="material-symbols-outlined text-xs text-tertiary-fixed">verified</span>
            <span>SHA-256 Immutable</span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-secondary-container/40 flex items-center justify-center text-tertiary-fixed">
          <span className="material-symbols-outlined text-xl">verified_user</span>
        </div>
      </div>
    </div>
  );
}
