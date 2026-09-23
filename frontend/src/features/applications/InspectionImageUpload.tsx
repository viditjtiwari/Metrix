"use client";

import React, { useState } from "react";
import { Camera, Upload, Award, AlertCircle, Image as ImageIcon, Eye, X } from "lucide-react";
import {
  useUploadInspectionImageMutation,
  useSelectCertificateImageMutation,
} from "./applicationApi";
import { resolveImageUrl } from "@/utils/formatters";

interface Props {
  inspectionId: number;
  imageUrls?: string[];
  certificateImageUrl?: string | null;
  canUpload?: boolean;
  canSelectCertImage?: boolean;
}

export function InspectionImageUpload({
  inspectionId,
  imageUrls = [],
  certificateImageUrl,
  canUpload = false,
  canSelectCertImage = false,
}: Props) {
  const [uploadImage, { isLoading: isUploading }] = useUploadInspectionImageMutation();
  const [selectCertImage, { isLoading: isSelecting }] = useSelectCertificateImageMutation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File size exceeds 5MB limit.");
      return;
    }

    setErrorMsg(null);
    try {
      await uploadImage({ inspectionId, file }).unwrap();
    } catch (err: unknown) {
      setErrorMsg(
        (err as { data?: { detail?: string } })?.data?.detail || "Failed to upload inspection proof."
      );
    }
  };

  const handleSelectCertImage = async (url: string) => {
    if (!canSelectCertImage) return;
    setErrorMsg(null);
    try {
      await selectCertImage({ inspectionId, imageUrl: url }).unwrap();
    } catch (err: unknown) {
      setErrorMsg(
        (err as { data?: { detail?: string } })?.data?.detail || "Failed to set certificate image."
      );
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs text-xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-blue-600" />
          <h3 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
            Inspection Verification Proof Photos
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          {imageUrls.length} Proof Photo{imageUrls.length === 1 ? "" : "s"}
        </span>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-[11px]">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid of uploaded photos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {imageUrls.map((url, idx) => {
          const isSelectedForCert = certificateImageUrl === url;
          return (
            <div
              key={idx}
              className={`group relative aspect-square rounded-xl overflow-hidden border transition-all cursor-pointer ${
                isSelectedForCert
                  ? "border-amber-400 ring-2 ring-amber-300 shadow-sm"
                  : "border-slate-200 bg-slate-50"
              }`}
              onClick={() => setPreviewUrl(url)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImageUrl(url)}
                alt={`Inspection observation view ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* View Overlay Button */}
              <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="p-1 rounded-full bg-slate-900/70 text-white flex items-center justify-center shadow-xs" title="View Full Image">
                  <Eye className="h-3.5 w-3.5" />
                </span>
              </div>

              {isSelectedForCert && (
                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-md bg-amber-500 text-slate-950 px-2 py-0.5 text-[9px] font-bold shadow-xs">
                  <Award className="h-3 w-3" />
                  Certificate Photo
                </div>
              )}

              {canSelectCertImage && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectCertImage(url);
                  }}
                  disabled={isSelecting || isSelectedForCert}
                  className={`absolute bottom-1.5 inset-x-1.5 py-1 px-1.5 rounded-lg text-[10px] font-semibold transition-opacity flex items-center justify-center gap-1 ${
                    isSelectedForCert
                      ? "bg-amber-600/90 text-white"
                      : "bg-slate-900/80 text-white opacity-0 group-hover:opacity-100 hover:bg-slate-900"
                  }`}
                >
                  <Award className="h-3 w-3" />
                  {isSelectedForCert ? "Active on Cert" : "Set for Certificate"}
                </button>
              )}
            </div>
          );
        })}

        {/* Upload Slot for Inspectors */}
        {canUpload && (
          <label className="relative aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/30 flex flex-col items-center justify-center cursor-pointer transition-colors p-2 text-center">
            <Upload className="h-5 w-5 text-slate-400 group-hover:text-blue-600 mb-1" />
            <span className="text-[10px] font-semibold text-slate-700">
              {isUploading ? "Uploading..." : "Add Proof Photo"}
            </span>
            <span className="text-[9px] text-slate-400 mt-0.5">JPG/PNG &lt; 5MB</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              disabled={isUploading}
              className="sr-only"
            />
          </label>
        )}
      </div>

      {imageUrls.length === 0 && !canUpload && (
        <div className="py-6 text-center text-slate-400 flex flex-col items-center gap-1.5">
          <ImageIcon className="h-7 w-7 text-slate-300" />
          <span className="text-xs">No inspection proof photographs recorded yet.</span>
        </div>
      )}

      {/* Enlarged Photo Modal Lightbox */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 p-4 backdrop-blur-xs"
          onClick={() => setPreviewUrl(null)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] bg-white rounded-2xl overflow-hidden shadow-2xl p-2 flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-slate-900/75 text-white hover:bg-slate-900 transition"
              aria-label="Close photo preview"
            >
              <X className="h-5 w-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveImageUrl(previewUrl)}
              alt="Enlarged Proof Preview"
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
