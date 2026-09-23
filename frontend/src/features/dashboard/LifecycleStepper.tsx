"use client";

import React, { useState } from "react";
import { UserRole } from "@/types";
import {
  Scale,
  FileCheck,
  CalendarClock,
  ClipboardList,
  Award,
  QrCode,
  ArrowRight,
  Sparkles,
  Info,
  CheckCircle2,
} from "lucide-react";

interface Props {
  role?: UserRole;
}

const PHASES = [
  {
    step: "01",
    title: "Instrument Registration",
    actor: "Instrument Owner",
    icon: Scale,
    color: "emerald",
    desc: "Register weighing & measuring devices with specifications, capacity units, and device photos.",
  },
  {
    step: "02",
    title: "Application Submission",
    actor: "Instrument Owner",
    icon: FileCheck,
    color: "blue",
    desc: "Submit request for initial verification or statutory periodic re-verification.",
  },
  {
    step: "03",
    title: "Review & Scheduling",
    actor: "Legal Metrology Officer",
    icon: CalendarClock,
    color: "indigo",
    desc: "LMO scrutinizes documents, approves review, and schedules field or laboratory inspection.",
  },
  {
    step: "04",
    title: "Inspection & Testing",
    actor: "LMO / GATC Verifier",
    icon: ClipboardList,
    color: "amber",
    desc: "Calibrate against working standards, log error tolerances, and upload proof photos.",
  },
  {
    step: "05",
    title: "Digital Certificate",
    actor: "Legal Metrology Officer",
    icon: Award,
    color: "teal",
    desc: "Generate digitally signed certificate with anti-tamper QR code and official stamping details.",
  },
  {
    step: "06",
    title: "Public QR Verification",
    actor: "Consumer / Enforcement",
    icon: QrCode,
    color: "violet",
    desc: "Scan QR code on certificate or physical stamp to instantly verify authenticity and expiry.",
  },
];

const ROLE_GUIDES: Record<
  string,
  { title: string; subtitle: string; steps: { title: string; action: string }[] }
> = {
  INSTRUMENT_OWNER: {
    title: "Owner's Quick Start Guide",
    subtitle: "Follow these 4 simple steps to certify your instruments",
    steps: [
      {
        title: "1. Register Instruments",
        action: "Go to 'My Instruments' and add your weighing scale or measuring instrument.",
      },
      {
        title: "2. Apply for Verification",
        action: "Go to 'My Applications', select your instrument, and submit a verification request.",
      },
      {
        title: "3. Inspection & Stamping",
        action: "Officer will visit on scheduled date or test at laboratory.",
      },
      {
        title: "4. Download Certificate",
        action: "Once verified, download your QR-coded Digital Certificate under 'My Certificates'.",
      },
    ],
  },
  LMO: {
    title: "Legal Metrology Officer Workflow",
    subtitle: "End-to-end statutory verification management",
    steps: [
      {
        title: "1. Scrutinize Applications",
        action: "Check 'Review Queue' to approve or reject pending requests.",
      },
      {
        title: "2. Schedule & Assign",
        action: "Set inspection date, location, and assign field officer or GATC laboratory.",
      },
      {
        title: "3. Verify Observations",
        action: "Review calibration readings and inspection photos recorded by testing officers.",
      },
      {
        title: "4. Issue Digital Certificate",
        action: "Grant formal verification and generate tamper-proof QR certificate.",
      },
    ],
  },
  GATC: {
    title: "Government Approved Test Centre Workflow",
    subtitle: "Laboratory testing and calibration recording",
    steps: [
      {
        title: "1. View Assigned Tests",
        action: "Inspect tests allocated to your laboratory in 'Assigned Inspections'.",
      },
      {
        title: "2. Perform Calibration",
        action: "Execute laboratory testing according to OIML R-76 standards.",
      },
      {
        title: "3. Log Observations",
        action: "Record observed values, tolerances, and upload test proof photos.",
      },
      {
        title: "4. Submit Test Report",
        action: "Mark inspection completed for final officer endorsement.",
      },
    ],
  },
  ADMIN: {
    title: "System Administrator Console",
    subtitle: "State-wide oversight and platform configuration",
    steps: [
      {
        title: "1. User & Role Management",
        action: "Authorize officers, assign LMO or GATC roles, and oversee registrations.",
      },
      {
        title: "2. Departmental Bulletins",
        action: "Publish circulars and statutory re-verification notices on Notice Board.",
      },
      {
        title: "3. Analytics & Reports",
        action: "Monitor state-wide application flow and export audit CSV reports.",
      },
      {
        title: "4. System Integrity",
        action: "Audit digital certificates and verify public QR verification health.",
      },
    ],
  },
};

export function LifecycleStepper({ role }: Props) {
  const [activeStep, setActiveStep] = useState(0);
  const guide = ROLE_GUIDES[role || "INSTRUMENT_OWNER"] || ROLE_GUIDES.INSTRUMENT_OWNER;

  return (
    <div className="space-y-4">
      {/* 6-Phase Lifecycle Banner */}
      <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/80 pb-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400">
              <Sparkles className="h-4 w-4" />
              National Metrology Framework (SIH26036)
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              6-Phase Digital Verification & Certification Flow
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Statutory verification lifecycle conforming to the Legal Metrology Act & OIML standards
            </p>
          </div>
          <span className="self-start md:self-auto rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-1 text-[11px] font-semibold text-emerald-300">
            End-to-End Online
          </span>
        </div>

        {/* 6 Stepper Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {PHASES.map((p, idx) => {
            const Icon = p.icon;
            const isSelected = activeStep === idx;
            return (
              <div
                key={p.step}
                onClick={() => setActiveStep(idx)}
                className={`cursor-pointer rounded-xl p-3 border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? "bg-white/15 border-emerald-400 ring-2 ring-emerald-400/30 shadow-lg scale-[1.02]"
                    : "bg-white/5 border-white/10 hover:bg-white/10"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 mb-2">
                    <span>PHASE {p.step}</span>
                    <Icon className="h-4 w-4 text-white/80" />
                  </div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{p.title}</h4>
                  <p className="text-[10px] text-slate-300 line-clamp-2 mt-1 leading-snug">
                    {p.desc}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-white/10 text-[10px] font-medium text-slate-400 flex items-center justify-between">
                  <span>{p.actor}</span>
                  {isSelected && <ArrowRight className="h-3 w-3 text-emerald-400" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role-Specific Getting Started Guide Card */}
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 shadow-xs">
        <div className="flex items-center gap-2 border-b border-emerald-200/60 pb-3 mb-4">
          <div className="p-1.5 rounded-lg bg-emerald-600 text-white">
            <Info className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
              {guide.title}
            </h3>
            <p className="text-[11px] text-emerald-800">{guide.subtitle}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {guide.steps.map((s, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-emerald-200/70 bg-white p-3.5 shadow-2xs space-y-1"
            >
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>{s.title}</span>
              </div>
              <p className="text-[11px] text-slate-600 pl-5 leading-relaxed">{s.action}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
