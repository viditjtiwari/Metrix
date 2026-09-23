"use client";

import React, { useState, useRef } from "react";
import { useBatchUploadInstrumentsMutation } from "./instrumentApi";
import { BatchInstrumentUploadResponse } from "@/types";
import { X, Upload, Download, CheckCircle2, AlertCircle, FileText, RefreshCw } from "lucide-react";

interface BatchRegisterModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const BatchRegisterModal: React.FC<BatchRegisterModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [uploadResult, setUploadResult] = useState<BatchInstrumentUploadResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [batchUpload, { isLoading: isUploading }] = useBatchUploadInstrumentsMutation();

  const handleDownloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    setErrorMessage(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      const token = typeof window !== "undefined" ? localStorage.getItem("metrix_token") : null;
      const res = await fetch(`${apiUrl}/instruments/csv-template`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        throw new Error("Failed to download CSV template.");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "instrument_batch_template.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error downloading CSV template";
      setErrorMessage(msg);
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        setErrorMessage("Please select a valid CSV (.csv) file.");
        return;
      }
      setSelectedFile(file);
      setErrorMessage(null);
      setUploadResult(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        setErrorMessage("Please drop a valid CSV (.csv) file.");
        return;
      }
      setSelectedFile(file);
      setErrorMessage(null);
      setUploadResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage("Please select a CSV file to upload.");
      return;
    }
    setErrorMessage(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const result = await batchUpload(formData).unwrap();
      setUploadResult(result);
      if (result.successful_count > 0) {
        onSuccess();
      }
    } catch (err: unknown) {
      const msg =
        (err as { data?: { detail?: string } })?.data?.detail ||
        "Batch registration failed. Please check the CSV format and try again.";
      setErrorMessage(msg);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Bulk Register Instruments (CSV)
            </h2>
            <p className="text-[11px] text-slate-400">
              Import multiple measuring instruments simultaneously using standard CSV templates
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-3 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Template Download Banner */}
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 flex items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-emerald-600" />
              Standard CSV Template
            </div>
            <p className="text-[11px] text-slate-500">
              Includes pre-configured headers: instrument_type, manufacturer, model, serial number, etc.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            disabled={isDownloadingTemplate}
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium transition shadow-2xs"
          >
            <Download className="h-3.5 w-3.5 text-slate-600" />
            {isDownloadingTemplate ? "Downloading..." : "Template"}
          </button>
        </div>

        {/* File Dropzone */}
        {!uploadResult && (
          <div className="mt-4 space-y-4">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition ${
                selectedFile
                  ? "border-emerald-500 bg-emerald-50/40"
                  : "border-slate-300 hover:border-emerald-400 hover:bg-slate-50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className={`mx-auto h-8 w-8 mb-2 ${selectedFile ? "text-emerald-600" : "text-slate-400"}`} />
              {selectedFile ? (
                <div>
                  <p className="text-xs font-semibold text-emerald-800">{selectedFile.name}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Click or drop to replace
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-medium text-slate-700">
                    Click to browse or drag and drop your CSV file here
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Maximum 100 instruments per batch file</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-2xs"
              >
                {isUploading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                {isUploading ? "Processing Batch..." : "Upload & Register"}
              </button>
            </div>
          </div>
        )}

        {/* Results Screen */}
        {uploadResult && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Rows</div>
                <div className="text-lg font-bold text-slate-800 mt-0.5">{uploadResult.total_rows}</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <div className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">Registered</div>
                <div className="text-lg font-bold text-emerald-700 mt-0.5">{uploadResult.successful_count}</div>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-center">
                <div className="text-[10px] uppercase font-bold text-rose-600 tracking-wider">Errors</div>
                <div className="text-lg font-bold text-rose-700 mt-0.5">{uploadResult.failed_count}</div>
              </div>
            </div>

            {uploadResult.successful_count > 0 && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  Successfully registered {uploadResult.successful_count} instrument(s) in the national registry.
                </span>
              </div>
            )}

            {uploadResult.errors.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-800">Row-level Issues:</div>
                <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100 text-xs">
                  {uploadResult.errors.map((err, i) => (
                    <div key={i} className="p-2.5 flex items-start gap-2 bg-white">
                      <span className="shrink-0 font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-semibold text-slate-600">
                        Row {err.row}
                      </span>
                      {err.serial_number && (
                        <span className="shrink-0 font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                          {err.serial_number}
                        </span>
                      )}
                      <span className="text-rose-600 text-[11px] leading-snug">{err.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
              >
                <RefreshCw className="h-3 w-3" /> Upload Another File
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 text-xs font-medium text-white hover:bg-emerald-700 transition"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
