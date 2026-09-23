"use client";

import React, { useState } from "react";
import { Camera, Trash2, Upload, AlertCircle, Image as ImageIcon, Eye, X } from "lucide-react";
import { useUploadInstrumentImageMutation, useDeleteInstrumentImageMutation } from "./instrumentApi";
import { resolveImageUrl } from "@/utils/formatters";

interface Props {
  instrumentId: number;
  imageUrls?: string[];
  canEdit?: boolean;
}

export function InstrumentImageUpload({ instrumentId, imageUrls = [], canEdit = true }: Props) {
  const [uploadImage, { isLoading: isUploading }] = useUploadInstrumentImageMutation();
  const [deleteImage, { isLoading: isDeleting }] = useDeleteInstrumentImageMutation();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imageUrls.length >= 3) {
      setErrorMsg("Maximum 3 photographs allowed per instrument.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("File size exceeds 5MB limit.");
      return;
    }

    setErrorMsg(null);
    try {
      await uploadImage({ id: instrumentId, file }).unwrap();
    } catch (err: unknown) {
      setErrorMsg(
        (err as { data?: { detail?: string } })?.data?.detail || "Failed to upload image."
      );
    }
  };

  const handleDelete = async (index: number) => {
    if (!confirm("Are you sure you want to delete this photograph?")) return;
    setErrorMsg(null);
    try {
      await deleteImage({ id: instrumentId, index }).unwrap();
    } catch (err: unknown) {
      setErrorMsg(
        (err as { data?: { detail?: string } })?.data?.detail || "Failed to delete image."
      );
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs text-xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
        <div className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-emerald-600" />
          <h3 className="font-semibold text-slate-900 uppercase tracking-wider text-[11px]">
            Instrument Photographs
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">
          {imageUrls.length} / 3 Uploaded
        </span>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-[11px]">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Grid of uploaded photos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {imageUrls.map((url, idx) => (
          <div
            key={idx}
            className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer shadow-2xs"
            onClick={() => setPreviewUrl(url)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveImageUrl(url)}
              alt={`Instrument view ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <span className="p-1.5 rounded-full bg-white/90 text-slate-800 shadow-sm" title="View Full Preview">
                <Eye className="h-4 w-4" />
              </span>
              {canEdit && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(idx);
                  }}
                  disabled={isDeleting}
                  className="p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition"
                  title="Delete photo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <span className="absolute bottom-1.5 left-2 bg-slate-900/75 text-white px-1.5 py-0.5 rounded text-[9px] font-mono">
              Photo #{idx + 1}
            </span>
          </div>
        ))}

        {/* Upload Slot if less than 3 */}
        {canEdit && imageUrls.length < 3 && (
          <label className="relative aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/30 flex flex-col items-center justify-center cursor-pointer transition-colors p-2 text-center">
            <Upload className="h-6 w-6 text-slate-400 group-hover:text-emerald-600 mb-1.5" />
            <span className="text-[11px] font-semibold text-slate-700">
              {isUploading ? "Uploading..." : "Upload Photo"}
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

      {imageUrls.length === 0 && !canEdit && (
        <div className="py-6 text-center text-slate-400 flex flex-col items-center gap-1.5">
          <ImageIcon className="h-7 w-7 text-slate-300" />
          <span className="text-xs">No instrument photographs uploaded.</span>
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
              alt="Enlarged Instrument Preview"
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
