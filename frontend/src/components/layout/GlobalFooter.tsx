"use client";

import React from "react";
import Link from "next/link";
import { Shield, QrCode, Phone, ExternalLink, Lock, CheckCircle2, Award } from "lucide-react";

export function GlobalFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      {/* Tricolor Top Accent */}
      <div className="h-1 w-full flex">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* Main Statutory Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Identity & Statutory Mandate */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold shadow-sm">
                <Shield size={20} />
              </div>
              <div>
                <span className="font-extrabold text-white text-lg tracking-tight">METRIX</span>
                <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-emerald-400 border border-emerald-500/30">
                  GOV.IN
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Online Verification and Digital Certification System for Weighing and Measuring Instruments, operating
              under the statutory framework of the <strong className="text-slate-300">Legal Metrology Act, 2009</strong>.
            </p>
            <div className="pt-2 text-xs text-slate-400 space-y-1">
              <div className="font-semibold text-slate-200">Legal Metrology Division</div>
              <div>Department of Consumer Affairs</div>
              <div>Ministry of Consumer Affairs, Food & Public Distribution</div>
              <div>Krishi Bhawan, New Delhi — 110001</div>
            </div>
          </div>

          {/* Column 2: Public Portals & Citizen Services */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">Public Services</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/verify/lookup" className="hover:text-emerald-400 transition flex items-center gap-1.5">
                  <QrCode size={13} className="text-emerald-500" />
                  <span>Public QR Certificate Scanner</span>
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-emerald-400 transition">
                  Commercial Instrument Registration
                </Link>
              </li>
              <li>
                <a
                  href="https://consumeraffairs.nic.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition flex items-center gap-1"
                >
                  <span>Dept of Consumer Affairs</span>
                  <ExternalLink size={11} className="opacity-70" />
                </a>
              </li>
              <li>
                <a
                  href="https://edaakhil.nic.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition flex items-center gap-1"
                >
                  <span>eDaakhil Consumer Grievance</span>
                  <ExternalLink size={11} className="opacity-70" />
                </a>
              </li>
              <li>
                <a
                  href="https://www.oiml.org"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition flex items-center gap-1"
                >
                  <span>OIML International Standards</span>
                  <ExternalLink size={11} className="opacity-70" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Standards & Guidelines */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">Statutory Framework</h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-teal-400 shrink-0" />
                <span>The Legal Metrology Act, 2009</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-teal-400 shrink-0" />
                <span>Legal Metrology (General) Rules, 2011</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-teal-400 shrink-0" />
                <span>OIML R-76 Non-Automatic Weighing</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-teal-400 shrink-0" />
                <span>GATC Calibration Regulations</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 size={13} className="text-teal-400 shrink-0" />
                <span>Anti-Tamper SHA-256 Digest Standard</span>
              </li>
            </ul>
          </div>

          {/* Column 4: National Helpline & Security */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-100">Helpline & Security</h3>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Phone size={14} />
                <span>National Consumer Helpline</span>
              </div>
              <div className="text-xl font-extrabold text-white font-mono tracking-wider">1915</div>
              <div className="text-[11px] text-slate-400">Toll-Free • 24x7 Assistance</div>
            </div>

            <div className="flex flex-col gap-1.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Lock size={12} className="text-emerald-400" />
                <span>256-Bit SSL Encrypted Statutory Pipeline</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300">
                <Award size={12} className="text-amber-400" />
                <span>Smart India Hackathon SIH26036</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Compliance Disclaimer */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {currentYear} Department of Consumer Affairs, Government of India. All Rights Reserved.
          </div>
          <div className="text-center md:text-right text-slate-400">
            Official Statutory Verification Platform • Developed under SIH Problem SIH26036
          </div>
        </div>
      </div>
    </footer>
  );
}
