"use client";

import React from "react";
import Link from "next/link";

interface LmoProps {
  metrics?: {
    applications_pending_review?: number;
    scheduled_inspections?: number;
    inspections_in_progress?: number;
    completed_inspections?: number;
    verified_applications?: number;
    rejected_applications?: number;
    certificates_issued?: number;
    certificates_expiring?: number;
  };
}

export function LmoDashboardView({ metrics }: LmoProps) {
  const pendingCount = metrics?.applications_pending_review ?? 0;
  const scheduledCount = metrics?.scheduled_inspections ?? 0;
  const inProgressCount = metrics?.inspections_in_progress ?? 0;
  const certsIssued = metrics?.certificates_issued ?? 0;

  const mockReviewQueue = [
    {
      id: "APP-20260920-A491",
      owner: "Reliance Retail Ltd • Supermarket Scale",
      type: "ELECTRONIC_BALANCE",
      location: "Connaught Place, New Delhi",
      submitted: "Today, 10:15 AM",
      status: "UNDER_REVIEW",
    },
    {
      id: "APP-20260919-C812",
      owner: "HPCL Filling Station No. 14",
      type: "PETROL_DISPENSER",
      location: "Barakhamba Road, New Delhi",
      submitted: "Yesterday, 04:30 PM",
      status: "UNDER_REVIEW",
    },
    {
      id: "APP-20260918-F203",
      owner: "Delhi Grain Merchants Warehouse",
      type: "WEIGHING_SCALE",
      location: "Narela Mandi, New Delhi",
      submitted: "2 days ago",
      status: "SCHEDULED",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Officer Sovereign Greeting Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-primary-container via-inverse-surface to-primary-container text-on-secondary p-6 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-surface-container-lowest/10 backdrop-blur flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-tertiary-fixed text-3xl">
                badge
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 className="font-headline font-bold text-xl text-on-secondary">
                  Welcome back, Officer Rajesh Sharma
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-tertiary-container text-tertiary-fixed text-[11px] font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed animate-ping" />
                  ACTIVE DUTY
                </span>
              </div>
              <p className="text-xs text-inverse-on-surface/80 flex items-center gap-2 flex-wrap">
                <span>Jurisdiction: <strong>Delhi Central Circle • Ward 04</strong></span>
                <span>•</span>
                <span>Badge: <code className="text-tertiary-fixed font-mono">DL-MET-08849</code></span>
                <span>•</span>
                <span className="text-tertiary-fixed">{scheduledCount} Field Visits Today</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/applications"
              className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary-container text-on-secondary font-semibold text-xs transition shadow-sm flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">assignment</span>
              <span>Review Applications</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Statutory Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-variant/50 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-outline uppercase text-[11px] font-semibold tracking-wider">
                Pending Reviews
              </span>
              <div className="font-headline font-bold text-2xl text-on-surface mt-1">
                {pendingCount}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-error-container/40 text-on-error-container flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">pending_actions</span>
            </div>
          </div>
          <span className="text-[11px] text-error font-semibold flex items-center gap-1 mt-3">
            <span className="material-symbols-outlined text-xs">schedule</span>
            Urgent • SLA &lt; 48h
          </span>
        </div>

        <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-variant/50 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-outline uppercase text-[11px] font-semibold tracking-wider">
                Scheduled Inspections
              </span>
              <div className="font-headline font-bold text-2xl text-on-surface mt-1">
                {scheduledCount}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">event_available</span>
            </div>
          </div>
          <span className="text-[11px] text-secondary font-semibold flex items-center gap-1 mt-3">
            <span className="material-symbols-outlined text-xs">directions_walk</span>
            3 Field visits ready
          </span>
        </div>

        <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-variant/50 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-outline uppercase text-[11px] font-semibold tracking-wider">
                Tests In-Progress
              </span>
              <div className="font-headline font-bold text-2xl text-on-surface mt-1">
                {inProgressCount}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">biotech</span>
            </div>
          </div>
          <span className="text-[11px] text-secondary font-semibold flex items-center gap-1 mt-3">
            Active in Circle Labs
          </span>
        </div>

        <div className="p-5 rounded-xl bg-surface-container-lowest border border-surface-variant/50 shadow-xs flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-outline uppercase text-[11px] font-semibold tracking-wider">
                Certificates Issued
              </span>
              <div className="font-headline font-bold text-2xl text-tertiary mt-1">
                {certsIssued}
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-tertiary-container text-tertiary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">verified</span>
            </div>
          </div>
          <span className="text-[11px] text-tertiary font-semibold flex items-center gap-1 mt-3">
            100% Tamper Proof Sealed
          </span>
        </div>
      </div>

      {/* Priority Review Applications Queue */}
      <div className="bg-surface-container-lowest rounded-xl border border-surface-variant/50 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-variant/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-xl">inbox</span>
            <h3 className="font-bold text-sm text-on-surface">
              Priority Applications Awaiting Officer Review
            </h3>
          </div>
          <Link
            href="/applications"
            className="text-xs font-semibold text-secondary hover:underline"
          >
            View All Applications &rarr;
          </Link>
        </div>

        <div className="divide-y divide-surface-variant/30 text-xs">
          {mockReviewQueue.map((app) => (
            <div
              key={app.id}
              className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container-low transition"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-container text-secondary flex items-center justify-center shrink-0 mt-0.5">
                  <span className="material-symbols-outlined text-lg">scale</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-on-surface">
                      {app.id}
                    </span>
                    <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                      {app.status}
                    </span>
                  </div>
                  <p className="font-semibold text-on-surface mt-0.5">{app.owner}</p>
                  <p className="text-on-surface-variant text-[11px]">{app.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="text-[11px] text-outline">{app.submitted}</span>
                <Link
                  href={`/applications`}
                  className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold transition"
                >
                  Review
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
