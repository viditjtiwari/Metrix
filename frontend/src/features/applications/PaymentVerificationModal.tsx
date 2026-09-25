"use client";

import React, { useState } from "react";
import { useVerifyPaymentMutation } from "./applicationApi";
import { ApplicationResponse } from "@/types";
import { CheckCircle, XCircle, ExternalLink, AlertCircle, X } from "lucide-react";

interface PaymentVerificationModalProps {
  app: ApplicationResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentVerificationModal: React.FC<PaymentVerificationModalProps> = ({
  app,
  onClose,
  onSuccess,
}) => {
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [verifyPayment, { isLoading }] = useVerifyPaymentMutation();

  const handleAction = async (isVerified: boolean) => {
    setError(null);
    if (!isVerified && !remarks.trim()) {
      setError("Please provide a reason / remark when rejecting a payment challan.");
      return;
    }

    try {
      await verifyPayment({
        id: app.id,
        data: {
          is_verified: isVerified,
          remarks: remarks.trim() || (isVerified ? "Challan verified with statutory account" : undefined),
        },
      }).unwrap();

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError((err as { data?: { detail?: string } })?.data?.detail || "Action failed.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Verify Payment Challan</h2>
            <p className="text-[11px] text-slate-500">Application: {app.application_number}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Challan Details Box */}
        <div className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Challan Ref No:</span>
            <span className="font-mono font-bold text-slate-900">{app.challan_reference_number || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Payment Date:</span>
            <span className="text-slate-800">{app.challan_date || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Total Fee:</span>
            <span className="font-mono font-bold text-emerald-700">₹{app.total_fee || 0}</span>
          </div>

          {app.payment_receipt_url && (
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
              <span className="text-slate-500">Receipt Attachment:</span>
              <a
                href={app.payment_receipt_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-emerald-600 hover:underline font-medium"
              >
                View Receipt Document <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Officer Verification Remarks <span className="text-slate-400 font-normal">(Optional for approval, required for rejection)</span>
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Verified with treasury scroll number 8812... or Reason for rejection..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleAction(false)}
              className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 font-medium hover:bg-rose-100 disabled:opacity-50 transition"
            >
              <XCircle className="h-3.5 w-3.5" />
              Reject Challan
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleAction(true)}
              className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              <CheckCircle className="h-3.5 w-3.5" />
              {isLoading ? "Processing..." : "Verify & Approve"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
