"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { GlobalTopNav } from "@/components/layout/GlobalTopNav";
import { GlobalFooter } from "@/components/layout/GlobalFooter";
import {
  Shield,
  Scale,
  FileCheck,
  QrCode,
  Building2,
  ClipboardCheck,
  Award,
  CheckCircle2,
  Lock,
  ArrowRight,
} from "lucide-react";
import { LandingNoticeBoard } from "@/features/notices/LandingNoticeBoard";

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Auto-redirect authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 1. Global Navigation Bar */}
      <GlobalTopNav />

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-emerald-50/60 via-slate-50/40 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-6 shadow-2xs">
            <Shield size={14} className="text-emerald-700" />
            <span>Smart India Hackathon 2026 • Problem SIH26036</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight max-w-4xl mx-auto">
            Online Verification & Digital Certification System for{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
              Weighing & Measuring Instruments
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Statutory legal metrology automation under the <strong>Legal Metrology Act, 2009</strong>. Complete lifecycle governance from device registration to tamper-evident, QR-coded digital certification.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3.5">
            <Link
              href="/login"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition shadow-md hover:shadow-lg text-sm"
            >
              <span>Access Portal</span>
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/verify/lookup"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-emerald-700 font-semibold transition shadow-2xs text-sm"
            >
              <QrCode size={16} className="text-emerald-600" />
              <span>Verify Certificate (Camera / ID)</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="mt-12 pt-8 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="flex items-center gap-2.5 p-2">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-slate-800">Legal Compliance</div>
                <div className="text-slate-500 text-[11px]">Act 2009 & Rules 2011</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2">
              <Lock size={18} className="text-emerald-600 shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-slate-800">SHA-256 Digest</div>
                <div className="text-slate-500 text-[11px]">Anti-tamper integrity</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2">
              <QrCode size={18} className="text-emerald-600 shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-slate-800">Level H QR Code</div>
                <div className="text-slate-500 text-[11px]">Instant camera scan</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2">
              <Award size={18} className="text-emerald-600 shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-slate-800">Bilingual PDF</div>
                <div className="text-slate-500 text-[11px]">Statutory watermark</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Statutory Notice Board */}
      <section id="notices" className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <LandingNoticeBoard />
        </div>
      </section>

      {/* 4. Four-Step Statutory Lifecycle */}
      <section className="py-16 bg-slate-50/70 border-y border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Workflow</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Four-Step Statutory Verification</h2>
            <p className="mt-2 text-sm text-slate-500">From commercial registration to digitally signed certification</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Scale size={24} />,
                title: "1. Instrument Registration",
                desc: "Register weighing & measuring instruments with technical specs, photo proof, or bulk CSV upload.",
              },
              {
                icon: <FileCheck size={24} />,
                title: "2. Verification Application",
                desc: "Submit initial or periodic re-verification requests directly to regional legal metrology controllers.",
              },
              {
                icon: <ClipboardCheck size={24} />,
                title: "3. Physical Inspection",
                desc: "Officers conduct field calibration tests, record physical observations, and upload verification photos.",
              },
              {
                icon: <Award size={24} />,
                title: "4. Digital Certification",
                desc: "Receive watermarked A4 digital certificates embedded with high-correction QR codes and SHA-256 hashes.",
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="relative p-6 rounded-2xl border border-slate-200 bg-white hover:shadow-md hover:border-emerald-300 transition group"
              >
                <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition shadow-2xs">
                  {step.icon}
                </div>
                <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Stakeholder Portals */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Governance</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">Dedicated Roles & Portals</h2>
            <p className="mt-2 text-sm text-slate-500">Separation of duties across regulatory actors</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Building2 size={22} />,
                role: "Instrument Owner",
                badge: "Commercial User",
                features: ["Register single or bulk CSV instruments", "Submit verification applications", "Download statutory PDF certificates", "Receive 30-day renewal warnings"],
              },
              {
                icon: <Shield size={22} />,
                role: "Legal Metrology Officer",
                badge: "State Inspector",
                features: ["Review verification requests", "Conduct physical inspections", "Log observation readings & photos", "Issue tamper-evident certificates"],
              },
              {
                icon: <ClipboardCheck size={22} />,
                role: "Approved Test Centre",
                badge: "GATC Laboratory",
                features: ["Perform specialized calibrations", "Input standard test weights & MPEs", "Record laboratory test results", "Submit verification determinations"],
              },
              {
                icon: <QrCode size={22} />,
                role: "Public / Consumer",
                badge: "Open Verification",
                features: ["Real-time camera QR scanner", "Certificate Unique Number lookup", "Anti-tamper SHA-256 fingerprint check", "Zero login required for public"],
              },
            ].map((s, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white border border-slate-200 hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    {s.icon}
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {s.badge}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{s.role}</h3>
                <ul className="mt-3 space-y-2">
                  {s.features.map((f, i) => (
                    <li key={i} className="text-xs text-slate-500 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Global Footer */}
      <GlobalFooter />
    </div>
  );
}
