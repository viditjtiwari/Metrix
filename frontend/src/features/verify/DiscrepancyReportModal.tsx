"use client";

import React, { useState } from "react";
import { AlertTriangle, CheckCircle, X, ShieldAlert, AlertCircle } from "lucide-react";

interface DiscrepancyReportModalProps {
  token: string;
  certificateNumber: string;
  onClose: () => void;
}

export const DiscrepancyReportModal: React.FC<DiscrepancyReportModalProps> = ({
  token,
  certificateNumber,
  onClose,
}) => {
  const [discrepancyType, setDiscrepancyType] = useState("TAMPERED_PHYSICAL_SEAL");
  const [description, setDescription] = useState("");
  const [reporterName, setReporterName] = useState("");
  const [reporterPhone, setReporterPhone] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successRef, setSuccessRef] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (description.trim().length < 10) {
      setError("Please provide at least 10 characters describing the irregularity.");
      return;
    }

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const res = await fetch(
        `${apiUrl}/public/certificates/${encodeURIComponent(token)}/report-discrepancy`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            discrepancy_type: discrepancyType,
            description: description.trim(),
            reporter_name: reporterName.trim() || undefined,
            reporter_phone: reporterPhone.trim() || undefined,
            evidence_image_url: evidenceUrl.trim() || undefined,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Submission failed. Please check inputs.");
      }

      const data = await res.json();
      setSuccessRef(data.report_reference_id);
    } catch (err: unknown) {
      setError((err as Error).message || "Failed to submit discrepancy report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-rose-600">
            <ShieldAlert className="h-5 w-5" />
            <h2 className="text-sm font-bold text-slate-900">Report Suspicious or Tampered Certificate</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {successRef ? (
          <div className="py-6 text-center space-y-3">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle className="h-7 w-7" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Discrepancy Report Registered</h3>
              <p className="text-slate-500 mt-1">Reference ID: <span className="font-mono font-bold text-slate-800">{successRef}</span></p>
            </div>
            <p className="text-slate-500 text-[11px] max-w-md mx-auto">
              Your confidential report has been forwarded to the Legal Metrology Division enforcement cell. Thank you for protecting consumer standards.
            </p>
            <div className="pt-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Certificate Reference:</span>
              <span className="font-mono font-bold text-slate-800 ml-2">{certificateNumber}</span>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Type of Discrepancy <span className="text-rose-500">*</span>
              </label>
              <select
                value={discrepancyType}
                onChange={(e) => setDiscrepancyType(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="TAMPERED_PHYSICAL_SEAL">Tampered / Snipped Physical Seal</option>
                <option value="EXPIRED_STAMP_IN_USE">Expired Instrument Actively in Use</option>
                <option value="SERIAL_MISMATCH">Serial Number on Plate Differs from Certificate</option>
                <option value="LOCATION_MISMATCH">Instrument Installed at Uncertified Location</option>
                <option value="OTHER">Other Metering or Weight Irregularity</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Description of Issue <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what you observed (e.g. Broken lead seal, faulty display, scale reads 100g heavy)..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Your Name (Optional)</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Anonymous or Name"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Contact Phone (Optional)</label>
                <input
                  type="tel"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="+91-..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Evidence Photo URL (Optional)</label>
              <input
                type="url"
                value={evidenceUrl}
                onChange={(e) => setEvidenceUrl(e.target.value)}
                placeholder="https://.../photo.jpg"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
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
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-rose-600 text-white font-medium hover:bg-rose-700 disabled:opacity-50 transition"
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                {loading ? "Submitting..." : "Submit Confidential Report"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
