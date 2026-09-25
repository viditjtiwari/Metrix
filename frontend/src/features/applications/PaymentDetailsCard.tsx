"use client";

import React from "react";
import { ApplicationDetailResponse } from "@/types";
import { CreditCard, ExternalLink, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";

interface Props {
  app: ApplicationDetailResponse;
}

export function PaymentDetailsCard({ app }: Props) {
  if (!app.payment_status && !app.challan_reference_number && !app.total_fee) {
    return null;
  }

  const getStatusBadge = () => {
    switch (app.payment_status) {
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Challan Verified
          </span>
        );
      case "UPLOADED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800">
            <Clock className="w-3.5 h-3.5 text-indigo-600" /> Verification Pending
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <XCircle className="w-3.5 h-3.5 text-rose-600" /> Challan Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Payment Required
          </span>
        );
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs text-xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-emerald-600" />
          <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
            Statutory Verification Fee & Challan (Rule 14)
          </h3>
        </div>
        {getStatusBadge()}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <span className="text-slate-400 block text-[11px]">Base Statutory Fee</span>
          <span className="font-semibold text-slate-900 text-sm">
            ₹{app.calculated_fee ? Number(app.calculated_fee).toLocaleString("en-IN") : "0.00"}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Late Fee Surcharge</span>
          <span className={`font-semibold text-sm ${Number(app.late_fee || 0) > 0 ? "text-rose-600" : "text-slate-700"}`}>
            ₹{app.late_fee ? Number(app.late_fee).toLocaleString("en-IN") : "0.00"}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Total Statutory Payable</span>
          <span className="font-bold text-emerald-700 text-sm">
            ₹{app.total_fee ? Number(app.total_fee).toLocaleString("en-IN") : "0.00"}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Treasury Challan Ref</span>
          <span className="font-mono font-medium text-slate-900">
            {app.challan_reference_number || "—"}
          </span>
        </div>
      </div>

      {(app.challan_date || app.payment_receipt_url || app.payment_remarks) && (
        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {app.challan_date && (
            <div>
              <span className="text-slate-400 block text-[11px]">Challan Date</span>
              <span className="text-slate-700 font-medium">{app.challan_date}</span>
            </div>
          )}
          {app.payment_receipt_url && (
            <div>
              <span className="text-slate-400 block text-[11px]">Challan Receipt / Document</span>
              <a
                href={app.payment_receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-emerald-600 font-medium hover:underline"
              >
                View Uploaded Receipt <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
          {app.payment_remarks && (
            <div>
              <span className="text-slate-400 block text-[11px]">Officer Remarks</span>
              <span className="text-slate-700 italic">{app.payment_remarks}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
