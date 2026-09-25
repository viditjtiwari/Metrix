"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Building2, Shield, ClipboardCheck, QrCode, ArrowRight, Check } from "lucide-react";

interface RoleData {
  id: string;
  label: string;
  icon: React.ReactNode;
  tagline: string;
  badge: string;
  legalBasis: string;
  features: string[];
  ctaText: string;
  ctaHref: string;
}

const ROLES: RoleData[] = [
  {
    id: "owner",
    label: "Business / Owner",
    icon: <Building2 size={18} />,
    tagline: "Digitally register weighing equipment and ensure statutory re-verification",
    badge: "Commercial User",
    legalBasis: "Legal Metrology Act, 2009 Section 24",
    features: [
      "Online device registration with model, serial & capacity parameters",
      "Bulk instrument onboarding via automated CSV batch processing",
      "Automated routing to LMO Field inspection or GATC Lab testing",
      "Instant watermarked PDF certificate download with 30-day renewal warnings"
    ],
    ctaText: "Register Your Equipment",
    ctaHref: "/login"
  },
  {
    id: "lmo",
    label: "Legal Metrology Officer",
    icon: <Shield size={18} />,
    tagline: "Scrutinize applications, conduct field calibrations, and issue digital stamps",
    badge: "District Inspector",
    legalBasis: "Legal Metrology (General) Rules, 2011",
    features: [
      "Prioritized scrutiny queue with clarification & scheduling controls",
      "Government-standard 6-point physical verification checklist",
      "Metrological test error calculation against Maximum Permissible Error (MPE)",
      "Physical lead seal assignment with statutory quarterly stamps (Q1–Q4)"
    ],
    ctaText: "Officer Sign In",
    ctaHref: "/login"
  },
  {
    id: "gatc",
    label: "Approved Test Centre",
    icon: <ClipboardCheck size={18} />,
    tagline: "Perform specialized calibrations on heavy industrial and specialized measuring assets",
    badge: "GATC Laboratory",
    legalBasis: "Legal Metrology GATC Rules, 2013",
    features: [
      "Automated lab intake for weighbridges, storage tanks & flow meters",
      "Multi-point span calibration and environmental factor recording",
      "Formal laboratory test determination and calibration log submission",
      "Export audit-ready laboratory inspection reports (A4 multi-page PDF)"
    ],
    ctaText: "Laboratory Access",
    ctaHref: "/login"
  },
  {
    id: "public",
    label: "Public / Consumer",
    icon: <QrCode size={18} />,
    tagline: "Zero-login transparency: verify any commercial scale or fuel dispenser instantly",
    badge: "Consumer Protection",
    legalBasis: "Protection against inaccurate commercial weights",
    features: [
      "Instant camera scan of QR codes affixed to commercial scales and pumps",
      "Manual lookup using Certificate Number or Instrument Registration ID",
      "Cryptographic SHA-256 fingerprint verification to detect counterfeit seals",
      "Direct display of inspecting officer name, issuing authority, and valid dates"
    ],
    ctaText: "Scan / Verify a Certificate",
    ctaHref: "/verify/lookup"
  }
];

export const RoleShowcaseTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState(ROLES[0].id);
  const activeRole = ROLES.find((r) => r.id === activeTab) || ROLES[0];

  return (
    <div className="space-y-6">
      {/* Role Switcher Pill Bar */}
      <div className="flex flex-wrap justify-center gap-2 p-1.5 rounded-2xl bg-slate-100/90 max-w-2xl mx-auto">
        {ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() => setActiveTab(role.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === role.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
            }`}
          >
            <span className={activeTab === role.id ? "text-emerald-600" : "text-slate-400"}>
              {role.icon}
            </span>
            <span>{role.label}</span>
          </button>
        ))}
      </div>

      {/* Role Feature Showcase Card */}
      <div className="max-w-3xl mx-auto rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {activeRole.badge}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {activeRole.legalBasis}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              {activeRole.tagline}
            </h3>
          </div>

          <Link
            href={activeRole.ctaHref}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shrink-0 transition"
          >
            <span>{activeRole.ctaText}</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {activeRole.features.map((feat, idx) => (
            <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <div className="h-5 w-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 font-bold">
                <Check size={12} />
              </div>
              <span className="text-slate-700 leading-relaxed font-medium">{feat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
