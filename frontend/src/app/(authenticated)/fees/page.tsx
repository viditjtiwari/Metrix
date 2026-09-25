"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCalculateFeeQuery } from "@/features/fees/feeApi";
import { PageHeader } from "@/components/ui/PageHeader";
import { INSTRUMENT_TYPES, getUnitOptionsForType } from "@/features/instruments/instrumentTypes";
import { InstrumentType } from "@/types";
import { Calculator, ArrowRight, ShieldAlert, CheckCircle2, Clock, Info } from "lucide-react";

export default function FeeCalculatorPage() {
  const [instrumentType, setInstrumentType] = useState<InstrumentType>("WEIGHING_SCALE");
  const [verificationType, setVerificationType] = useState<"INITIAL" | "PERIODIC">("INITIAL");
  const [capacityValue, setCapacityValue] = useState<string>("50");
  const [capacityUnit, setCapacityUnit] = useState<string>("kg");
  const [delayDays, setDelayDays] = useState<number>(0);

  const unitOptions = getUnitOptionsForType(instrumentType);

  const handleTypeChange = (newType: InstrumentType) => {
    setInstrumentType(newType);
    const opts = getUnitOptionsForType(newType);
    if (opts.length > 0) setCapacityUnit(opts[0].value);
  };

  const previousExpiryDate = delayDays > 0
    ? new Date(Date.now() - delayDays * 86400000).toISOString().split("T")[0]
    : undefined;

  const { data: feeData, isLoading } = useCalculateFeeQuery({
    instrument_type: instrumentType,
    verification_type: verificationType,
    capacity: capacityValue || undefined,
    capacity_unit: capacityUnit,
    previous_expiry_date: previousExpiryDate,
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Statutory Verification Fee Calculator"
        description="Estimate official verification fees and late surcharges pursuant to Rule 14 & Schedule XII of the Legal Metrology (General) Rules, 2011."
        badge={<Calculator size={18} className="text-slate-400" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Inputs Panel */}
        <div className="md:col-span-2 space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs text-xs">
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Instrument Category / Type
            </label>
            <select
              value={instrumentType}
              onChange={(e) => handleTypeChange(e.target.value as InstrumentType)}
              className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white focus:ring-2 focus:ring-emerald-500"
            >
              {INSTRUMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-800 mb-1">Verification Purpose</label>
              <select
                value={verificationType}
                onChange={(e) => setVerificationType(e.target.value as "INITIAL" | "PERIODIC")}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs bg-white focus:ring-2 focus:ring-emerald-500"
              >
                <option value="INITIAL">Initial Verification (New Device)</option>
                <option value="PERIODIC">Periodic Re-verification (Annual / Biennial)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-800 mb-1">Capacity & Unit</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  value={capacityValue}
                  onChange={(e) => setCapacityValue(e.target.value)}
                  placeholder="50"
                  className="flex-1 rounded-lg border border-slate-300 p-2 text-xs focus:ring-2 focus:ring-emerald-500"
                />
                <select
                  value={capacityUnit}
                  onChange={(e) => setCapacityUnit(e.target.value)}
                  className="w-24 rounded-lg border border-slate-300 p-2 text-xs font-semibold text-emerald-800 bg-emerald-50/50"
                >
                  {unitOptions.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {verificationType === "PERIODIC" && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-800">
                  Delay Beyond Re-verification Due Date (Days)
                </label>
                <span className="font-mono font-bold text-amber-700">{delayDays} days</span>
              </div>
              <input
                type="range"
                min="0"
                max="365"
                step="5"
                value={delayDays}
                onChange={(e) => setDelayDays(parseInt(e.target.value, 10))}
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>0 days (On Time)</span>
                <span>30d (Grace)</span>
                <span>90d (1 Quarter)</span>
                <span>180d (2 Quarters)</span>
                <span>365d (1 Year)</span>
              </div>
            </div>
          )}

          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-slate-600 space-y-1 text-[11px]">
            <div className="font-semibold text-slate-800 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-blue-600" /> Statutory Provision
            </div>
            <p>
              Under Rule 14(2) of the Legal Metrology (General) Rules 2011, applications delayed beyond the 30-day statutory grace period incur a late fee of 50% compounding for every delayed quarter (90 days).
            </p>
          </div>
        </div>

        {/* Right Output Card */}
        <div className="space-y-4">
          <div className="rounded-xl border border-emerald-200 bg-gradient-to-b from-emerald-50/80 to-white p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 border-b border-emerald-200/60 pb-2">
              Fee Estimate Summary
            </h3>

            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-400">Calculating statutory fee...</div>
            ) : feeData ? (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Base Verification Fee:</span>
                  <span className="font-bold text-slate-900">₹{Number(feeData.base_fee).toLocaleString("en-IN")}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Late Fee Surcharge:</span>
                  <span className={`font-bold ${Number(feeData.late_fee) > 0 ? "text-rose-600" : "text-emerald-700"}`}>
                    ₹{Number(feeData.late_fee).toLocaleString("en-IN")}
                  </span>
                </div>

                {feeData.quarters_delayed > 0 && (
                  <div className="flex items-center justify-between text-[11px] text-amber-800 bg-amber-50 p-2 rounded">
                    <span>Compounded Quarters:</span>
                    <span className="font-bold">{feeData.quarters_delayed} Quarter(s)</span>
                  </div>
                )}

                <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-900">Total Statutory Payable:</span>
                  <span className="font-extrabold text-emerald-700 text-lg">
                    ₹{Number(feeData.total_fee).toLocaleString("en-IN")}
                  </span>
                </div>

                {feeData.breakdown_notes && (
                  <div className="pt-2 text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">Schedule XII Notes:</span> {feeData.breakdown_notes}
                  </div>
                )}
              </div>
            ) : null}

            <Link
              href="/instruments"
              className="w-full mt-2 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition"
            >
              Proceed to Instrument Registry <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
