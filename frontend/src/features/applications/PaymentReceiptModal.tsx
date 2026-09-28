"use client";

import React, { useState, useRef } from "react";
import { useUploadPaymentReceiptMutation, useUploadChallanImageMutation } from "./applicationApi";
import { useCalculateFeeQuery } from "@/features/fees/feeApi";
import { ApplicationResponse, InstrumentType } from "@/types";
import { CreditCard, Upload, CheckCircle2, AlertCircle, X, ImageIcon, Loader2 } from "lucide-react";

interface PaymentReceiptModalProps {
  app: ApplicationResponse;
  onClose: () => void;
  onSuccess: () => void;
}

const MAX_FILE_SIZE_MB = 5;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  app,
  onClose,
  onSuccess,
}) => {
  const [challanNumber, setChallanNumber] = useState("");
  const [challanDate, setChallanDate] = useState(new Date().toISOString().split("T")[0]);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadReceipt, { isLoading: isSubmitting }] = useUploadPaymentReceiptMutation();
  const [uploadImage, { isLoading: isUploading }] = useUploadChallanImageMutation();

  const { data: feeData, isLoading: feeLoading } = useCalculateFeeQuery({
    instrument_type: (app as unknown as { instrument_type?: InstrumentType }).instrument_type || "WEIGHING_SCALE",
    verification_type: app.application_type || "INITIAL",
  });

  const isLoading = isSubmitting || isUploading;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Invalid file type. Please upload a JPG, PNG, WebP image or PDF.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setError(`File size exceeds ${MAX_FILE_SIZE_MB}MB limit.`);
      return;
    }

    setReceiptFile(file);

    // Generate preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setReceiptPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview(null);
    }
  };

  const handleRemoveFile = () => {
    setReceiptFile(null);
    setReceiptPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!challanNumber.trim()) {
      setError("Please enter the SBI / Treasury Challan reference number.");
      return;
    }
    if (!receiptFile) {
      setError("Please upload a scanned copy of the challan receipt.");
      return;
    }

    try {
      // Step 1: Upload the image file to get a hosted URL
      const { url } = await uploadImage(receiptFile).unwrap();

      // Step 2: Submit challan data with the uploaded image URL
      await uploadReceipt({
        id: app.id,
        data: {
          challan_reference_number: challanNumber.trim(),
          challan_date: challanDate || undefined,
          payment_receipt_url: url,
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

          {/* File Upload Section */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Upload Challan / Receipt Image <span className="text-rose-500">*</span>
            </label>

            {!receiptFile ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/50 p-5 flex flex-col items-center gap-2 text-slate-500 hover:text-emerald-700 transition-all cursor-pointer group"
              >
                <div className="p-2.5 rounded-full bg-slate-100 group-hover:bg-emerald-100 transition">
                  <Upload className="h-5 w-5" />
                </div>
                <span className="font-medium text-xs">Click to upload challan receipt</span>
                <span className="text-[10px] text-slate-400">
                  JPG, PNG, WebP or PDF — Max {MAX_FILE_SIZE_MB}MB
                </span>
              </button>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center gap-3">
                {receiptPreview ? (
                  <img
                    src={receiptPreview}
                    alt="Challan preview"
                    className="h-16 w-16 rounded-lg object-cover border border-slate-200 shrink-0"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <ImageIcon className="h-6 w-6 text-emerald-700" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate">{receiptFile.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {(receiptFile.size / 1024).toFixed(1)} KB • {receiptFile.type.split("/")[1]?.toUpperCase()}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-600 font-medium">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Ready to upload</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition shrink-0"
                  title="Remove file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Upload scanned treasury challan, SBI counter counterfoil, or online e-receipt screenshot.
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
              className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 transition flex items-center gap-1.5"
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {isUploading ? "Uploading Image..." : isSubmitting ? "Submitting..." : "Submit Challan Receipt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
