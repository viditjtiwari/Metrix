"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { GlobalTopNav } from "@/components/layout/GlobalTopNav";
import { GlobalFooter } from "@/components/layout/GlobalFooter";
import { InteractiveCertificateDemo } from "@/features/landing/InteractiveCertificateDemo";
import { RoleShowcaseTabs } from "@/features/landing/RoleShowcaseTabs";
import { RoutingExplainer } from "@/features/landing/RoutingExplainer";
import { LandingNoticeBoard } from "@/features/notices/LandingNoticeBoard";
import {
  Shield,
  QrCode,
  ArrowRight,
  CheckCircle2,
  Lock,
  Award,
  Scale,
  Sparkles,
  Calculator,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Auto-redirect authenticated users directly to their dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 1. Global Navigation Bar */}
      <GlobalTopNav />

      {/* 2. Hero Section with Side-by-Side Headline & Notice Board */}
      <section className="relative overflow-hidden py-10 sm:py-16 bg-gradient-to-b from-emerald-50/70 via-slate-50/40 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Column: Left-aligned Headline, Subtitle, & CTAs */}
            <div className="lg:col-span-7 text-left">
              {/* National Badge with Gentle Floating Animation */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/90 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-5 shadow-2xs animate-float-slow">
                <Shield size={14} className="text-emerald-700" />
                <span>Ministry of Consumer Affairs • Legal Metrology Act, 2009</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
                Online Verification & Digital Certification for{" "}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                  Weighing & Measuring Instruments
                </span>
              </h1>

              <p className="mt-4 sm:mt-5 text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                India's statutory legal metrology verification portal. Complete lifecycle governance from online device registration to tamper-evident, QR-coded digital certification.
              </p>

              {/* Call to Actions - Left-aligned */}
              <div className="mt-7 sm:mt-8 flex flex-wrap items-center gap-3.5">
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition shadow-md hover:shadow-lg text-sm group"
                >
                  <span>Access Regulatory Portal</span>
                  <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/verify/lookup"
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-emerald-700 font-semibold transition shadow-2xs text-sm"
                >
                  <QrCode size={16} className="text-emerald-600" />
                  <span>Verify a Certificate (QR / ID)</span>
                </Link>
                <Link
                  href="/fees"
                  className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 hover:text-emerald-700 font-semibold transition shadow-2xs text-sm"
                >
                  <Calculator size={16} className="text-emerald-600" />
                  <span>Fee Calculator</span>
                </Link>
              </div>
            </div>

            {/* Right Column: Latest News & Updates / Circulars Notice Card */}
            <div className="lg:col-span-5 w-full pt-1 lg:pt-0">
              <LandingNoticeBoard />
            </div>
          </div>

          {/* Interactive Live Certificate Demo */}
          <div className="mt-12 sm:mt-16">
            <InteractiveCertificateDemo />
          </div>

          {/* Trust Highlights */}
          <div className="mt-12 pt-8 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/70 border border-slate-100">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-slate-800">Section 24 Stamped</div>
                <div className="text-slate-500 text-[11px]">Statutory seal verification</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/70 border border-slate-100">
              <Lock size={18} className="text-emerald-600 shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-slate-800">SHA-256 Digest</div>
                <div className="text-slate-500 text-[11px]">Anti-tamper protection</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/70 border border-slate-100">
              <QrCode size={18} className="text-emerald-600 shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-slate-800">Level H QR Code</div>
                <div className="text-slate-500 text-[11px]">Instant camera lookup</div>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/70 border border-slate-100">
              <Award size={18} className="text-emerald-600 shrink-0" />
              <div className="text-xs">
                <div className="font-bold text-slate-800">Rule 13 Validity</div>
                <div className="text-slate-500 text-[11px]">12, 24 & 60 month rules</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Statutory Auto-Routing: LMO Field vs GATC Lab */}
      <section className="py-16 bg-slate-50/70 border-y border-slate-200/70">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Intelligent Routing</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Field Verification vs. Laboratory Calibration
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Automated statutory routing ensures high-capacity measuring equipment is directed to accredited test centres.
            </p>
          </div>

          <RoutingExplainer />
        </div>
      </section>

      {/* 4. Interactive Stakeholder Governance Tabs */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Role Governance</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
              Dedicated Regulatory Portals
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
              Distinct operational workspaces tailored to each participant in the legal metrology ecosystem.
            </p>
          </div>

          <RoleShowcaseTabs />
        </div>
      </section>

      {/* 5. Global Footer */}
      <GlobalFooter />
    </div>
  );
}
