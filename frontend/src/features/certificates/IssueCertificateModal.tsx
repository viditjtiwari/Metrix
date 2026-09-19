"use client";

import React, { useState } from "react";
import { useIssueCertificateMutation } from "./certificateApi";

interface IssueCertificateModalProps {
  applicationId: number;
  applicationNumber: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const IssueCertificateModal: React.FC<IssueCertificateModalProps> = ({
  applicationId,
  applicationNumber,
  onClose,
  onSuccess,
}) => {
  const [remarks, setRemarks] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [issueCertificate, { isLoading }] = useIssueCertificateMutation();

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    try {
      await issueCertificate({
        applicationId,
        data: { remarks: remarks.trim() || undefined },
      }).unwrap();

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const detail =
        (err as { data?: { detail?: string } })?.data?.detail ||
        "Failed to issue digital certificate.";
      setErrorMsg(detail);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100 text-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Issue Verification Certificate</h2>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">App: {applicationNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none"
          >
            &times;
          </button>
        </div>

        {errorMsg && (
          <div className="mt-3 rounded-lg bg-rose-50 p-2.5 text-rose-700 border border-rose-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleIssue} className="mt-4 space-y-4">
          <div className="rounded-lg bg-emerald-50/60 border border-emerald-200 p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold">
              <span>📜 Statutory Certification</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              This action generates an official digital certificate stamped with a deterministic
              SHA-256 integrity hash, an unguessable public QR verification token, and a standard 1-year statutory validity duration.
            </p>
            <div className="text-[11px] font-medium text-emerald-700">
              ● Application status will advance to <b>CERTIFICATE_ISSUED</b>.
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Issuance Remarks (Optional)
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Fit for commercial use under Class II metrological standards"
              className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs disabled:opacity-50"
            >
              {isLoading ? "Issuing..." : "Confirm & Issue Certificate"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
