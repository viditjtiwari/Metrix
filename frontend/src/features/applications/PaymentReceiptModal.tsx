"use client";

import React, { useState } from "react";
import { useUploadPaymentReceiptMutation } from "./applicationApi";
import { useCalculateFeeQuery } from "@/features/fees/feeApi";
import { ApplicationResponse, InstrumentType } from "@/types";
import { CreditCard, FileText, CheckCircle2, AlertCircle, X } from "lucide-react";

interface PaymentReceiptModalProps {
  app: ApplicationResponse;
  onClose: () => void;
  onSuccess: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  app,
  onClose,
  onSuccess,
}) => {
  const [challanNumber, setChallanNumber] = useState("");
  const [challanDate, setChallanDate] = useState(new Date().toISOString().split("T")[0]);
  const [receiptUrl, setReceiptUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [uploadReceipt, { isLoading }] = useUploadPaymentReceiptMutation();

  const { data: feeData, isLoading: feeLoading } = useCalculateFeeQuery({
    instrument_type: (app as unknown as { instrument_type?: InstrumentType }).instrument_type || "WEIGHING_SCALE",
    verification_type: app.application_type || "INITIAL",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!challanNumber.trim()) {
      setError("Please enter the SBI / Treasury Challan reference number.");
      return;
    }
    if (!receiptUrl.trim()) {
      setError("Please provide the URL or link to the uploaded payment challan receipt.");
      return;
    }

    try {
      await uploadReceipt({
        id: app.id,
        data: {
          challan_reference_number: challanNumber.trim(),
          challan_date: challanDate || undefined,
          payment_receipt_url: receiptUrl.trim(),
          calculated_fee: feeData?.base_fee || 100,
          late_fee: feeData?.late_fee || 0,
          total_fee: feeData?.total_fee || 100,
        },
      }).unwrap();

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError((err as { data?: { detail?: string } })?.data?.detail || "Failed to upload payment receipt.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Upload Statutory Challan Receipt</h2>
              <p className="text-[11px] text-slate-500">Legal Metrology Rule 14 Verification Fee</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Fee Summary Box */}
        <div className="my-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-600 font-medium">Statutory Base Fee:</span>
            <span className="font-mono font-semibold text-slate-900">₹{feeData?.base_fee ?? 100}</span>
          </div>
          {(feeData?.late_fee ?? 0) > 0 && (
            <div className="flex items-center justify-between mb-1 text-rose-600">
              <span>Rule 14(2) Late Penalty ({feeData?.quarters_delayed} qtr):</span>
              <span className="font-mono font-semibold">+₹{feeData?.late_fee}</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-1.5 border-t border-slate-200 font-bold text-slate-900">
            <span>Total Payable Amount:</span>
            <span className="text-sm font-mono text-emerald-700">₹{feeData?.total_fee ?? 100}</span>
          </div>
          {feeData?.breakdown_notes && (
            <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">{feeData.breakdown_notes}</p>
          )}
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Treasury / Bank Challan Ref No. <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={challanNumber}
              onChange={(e) => setChallanNumber(e.target.value)}
              placeholder="e.g. SBI-EPAY-2026-09823 or TREASURY-7712"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Challan Payment Date</label>
            <input
              type="date"
              value={challanDate}
              onChange={(e) => setChallanDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Receipt Document / Photo URL <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              required
              value={receiptUrl}
              onChange={(e) => setReceiptUrl(e.target.value)}
              placeholder="https://.../challan_receipt.pdf or image link"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Provide link to scanned treasury challan, SBI counter counterfoil, or online e-receipt.
            </p>
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
              type="submit"
              disabled={isLoading || feeLoading}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {isLoading ? "Uploading..." : "Submit Challan Receipt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
