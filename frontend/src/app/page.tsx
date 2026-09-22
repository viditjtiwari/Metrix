"use client";

import React from "react";
import Link from "next/link";
import { Shield, Scale, FileCheck, QrCode, Users, Building2, ClipboardCheck, Award } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header className="border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg">
              M
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-900">METRIX</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/verify/lookup" className="text-sm text-slate-600 hover:text-slate-900 transition hidden sm:inline">
              Verify Certificate
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition shadow-sm"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 sm:py-24 bg-gradient-to-b from-emerald-50/50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold mb-6">
            <Shield size={14} /> Smart India Hackathon 2026 — SIH26036
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight max-w-3xl mx-auto">
            Digital Verification System for{" "}
            <span className="text-emerald-600">Weighing & Measuring Instruments</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A unified platform to digitize the entire lifecycle under the Legal Metrology Act, 2009 — 
            from instrument registration and inspection to QR-verifiable digital certification.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition shadow-md hover:shadow-lg"
            >
              Get Started
            </Link>
            <Link
              href="/verify/lookup"
              className="px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-700 font-semibold hover:border-slate-300 hover:bg-slate-50 transition"
            >
              Verify a Certificate
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900">How It Works</h2>
            <p className="mt-2 text-sm text-slate-500">Four steps from registration to certified compliance</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Scale size={24} />, title: "Register", desc: "Register your weighing & measuring instruments with serial numbers and specifications" },
              { icon: <FileCheck size={24} />, title: "Apply", desc: "Submit verification or re-verification applications through the digital portal" },
              { icon: <ClipboardCheck size={24} />, title: "Inspect", desc: "Officers conduct field or lab inspections with digital observation checklists" },
              { icon: <Award size={24} />, title: "Certify", desc: "Receive QR-enabled digital certificates with tamper-evident integrity hashes" },
            ].map((step, idx) => (
              <div key={idx} className="relative p-6 rounded-xl border border-slate-200 bg-white hover:shadow-md transition group">
                <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition">
                  {step.icon}
                </div>
                <div className="absolute top-4 right-4 text-4xl font-bold text-slate-100">{idx + 1}</div>
                <h3 className="text-base font-bold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stakeholders */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-slate-900">Built for Every Stakeholder</h2>
            <p className="mt-2 text-sm text-slate-500">Role-based access ensuring each actor sees what they need</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Building2 size={22} />, role: "Instrument Owner", color: "emerald", features: ["Register instruments", "Submit applications", "Download certificates", "Track expiry dates"] },
              { icon: <Shield size={22} />, role: "Legal Metrology Officer", color: "blue", features: ["Review applications", "Schedule inspections", "Record observations", "Issue certificates"] },
              { icon: <ClipboardCheck size={22} />, role: "Approved Test Centre", color: "teal", features: ["View assignments", "Conduct inspections", "Record test readings", "Submit results"] },
              { icon: <QrCode size={22} />, role: "Public / Consumer", color: "slate", features: ["Scan QR codes", "Verify certificates", "Check validity", "No login required"] },
            ].map((s, idx) => (
              <div key={idx} className="p-6 rounded-xl bg-white border border-slate-200 hover:shadow-md transition">
                <div className={`h-10 w-10 rounded-lg bg-${s.color}-50 text-${s.color}-600 flex items-center justify-center mb-3`}>
                  {s.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-900">{s.role}</h3>
                <ul className="mt-3 space-y-1.5">
                  {s.features.map((f, i) => (
                    <li key={i} className="text-xs text-slate-500 flex items-start gap-2">
                      <span className="text-emerald-500 mt-0.5">✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">M</div>
            <span className="text-sm font-semibold text-slate-700">METRIX</span>
            <span className="text-xs text-slate-400">© {new Date().getFullYear()}</span>
          </div>
          <div className="text-xs text-slate-400 text-center sm:text-right">
            Ministry of Consumer Affairs, Food & Public Distribution<br />
            Department of Consumer Affairs — Legal Metrology Division
          </div>
        </div>
      </footer>
    </div>
  );
}
