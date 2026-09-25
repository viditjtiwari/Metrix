"use client";

import React, { useState } from "react";
import {
  useRequestClarificationMutation,
  useRespondClarificationMutation,
} from "./applicationApi";
import { ApplicationResponse } from "@/types";
import { MessageSquare, AlertCircle, X, Send } from "lucide-react";

interface ClarificationModalProps {
  app: ApplicationResponse;
  mode: "request" | "respond";
  onClose: () => void;
  onSuccess: () => void;
}

export const ClarificationModal: React.FC<ClarificationModalProps> = ({
  app,
  mode,
  onClose,
  onSuccess,
}) => {
  const [remarks, setRemarks] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [requestClarification, { isLoading: requesting }] = useRequestClarificationMutation();
  const [respondClarification, { isLoading: responding }] = useRespondClarificationMutation();

  const isRequestMode = mode === "request";
  const isLoading = requesting || responding;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!remarks.trim()) {
      setError(
        isRequestMode
          ? "Please specify the clarification query or required documents."
          : "Please write your clarification response."
      );
      return;
    }

    try {
      if (isRequestMode) {
        await requestClarification({
          id: app.id,
          data: { remarks: remarks.trim() },
        }).unwrap();
      } else {
        await respondClarification({
          id: app.id,
          data: { remarks: remarks.trim() },
        }).unwrap();
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(
        (err as { data?: { detail?: string } })?.data?.detail || "Operation failed. Please try again."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl border border-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${isRequestMode ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {isRequestMode ? "Request Clarification from Applicant" : "Respond to Clarification Query"}
              </h2>
              <p className="text-[11px] text-slate-500">Application: {app.application_number}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="my-4 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              {isRequestMode ? "Clarification Query / Information Needed" : "Your Explanation / Response"}
            </label>
            <textarea
              required
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={
                isRequestMode
                  ? "e.g. Please upload a clear photo of the manufacturer nameplate or explain capacity discrepancy..."
                  : "e.g. As requested, the nameplate photo has been uploaded and serial number confirmed..."
              }
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              {isRequestMode
                ? "This will notify the applicant and pause scrutiny until a response is provided."
                : "Submitting this response will notify the reviewing officer and resume scrutiny."}
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
              disabled={isLoading}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-white font-medium disabled:opacity-50 transition ${
                isRequestMode ? "bg-amber-600 hover:bg-amber-700" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              {isLoading ? "Submitting..." : isRequestMode ? "Send Clarification Request" : "Send Response"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
