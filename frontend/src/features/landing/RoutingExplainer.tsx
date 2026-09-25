"use client";

import React from "react";
import { Scale, Factory, ArrowRight, ShieldCheck } from "lucide-react";

export const RoutingExplainer: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
      {/* Route 1: LMO Field Inspection */}
      <div className="p-6 rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/50 via-white to-white shadow-2xs hover:shadow-md hover:border-blue-200 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <Scale size={20} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
            Field Verification
          </span>
        </div>
        <h3 className="text-base font-bold text-slate-900">
          Standard Commercial Instruments (LMO)
        </h3>
        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
          Daily trade instruments verified on-site by regional Legal Metrology Officers using mobile standard testing equipment.
        </p>
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
          {["Platform Scales", "Counter Machines", "Electronic Balances", "Petrol & Diesel Dispensers", "Length Measures"].map((tag) => (
            <span key={tag} className="text-[10px] font-medium bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Route 2: GATC Laboratory Auto-Routing */}
      <div className="p-6 rounded-3xl border border-violet-100 bg-gradient-to-br from-violet-50/50 via-white to-white shadow-2xs hover:shadow-md hover:border-violet-200 transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="h-10 w-10 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center">
            <Factory size={20} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-violet-100 text-violet-800">
            Laboratory Auto-Routing
          </span>
        </div>
        <h3 className="text-base font-bold text-slate-900">
          Specialized & High-Capacity Assets (GATC)
        </h3>
        <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
          High-capacity assets automatically routed to Government Approved Test Centres (GATC Rules, 2013) for multi-point lab calibrations.
        </p>
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5">
          {["Vehicle Weighbridges", "Calibrated Storage Tanks", "Tank Lorries", "Coriolis Flow Meters", "Gas Meters"].map((tag) => (
            <span key={tag} className="text-[10px] font-medium bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
