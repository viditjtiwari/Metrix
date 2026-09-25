"use client";

import React, { useState } from "react";
import { useCreateInstrumentMutation, useUploadInstrumentImageMutation } from "./instrumentApi";
import { InstrumentType } from "@/types";
import { Instrument, INSTRUMENT_TYPES, getUnitOptionsForType } from "./instrumentTypes";
import { Camera, X, FileText, CheckCircle2 } from "lucide-react";

interface RegisterInstrumentModalProps {
  onClose: () => void;
  onSuccess: (instrument: Instrument) => void;
}

export const RegisterInstrumentModal: React.FC<RegisterInstrumentModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [instrumentType, setInstrumentType] = useState<InstrumentType>("WEIGHING_SCALE");
  const [manufacturer, setManufacturer] = useState("");
  const [modelName, setModelName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [minCapacity, setMinCapacity] = useState("");
  const [maxCapacity, setMaxCapacity] = useState("");
  const [capacityUnit, setCapacityUnit] = useState("kg");
  const [location, setLocation] = useState("");
  const [tacUrl, setTacUrl] = useState("");
  const [invoiceUrl, setInvoiceUrl] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [createInstrument, { isLoading }] = useCreateInstrumentMutation();
  const [uploadImage] = useUploadInstrumentImageMutation();

  const handleTypeChange = (newType: InstrumentType) => {
    setInstrumentType(newType);
    const opts = getUnitOptionsForType(newType);
    if (opts.length > 0) setCapacityUnit(opts[0].value);
  };

  const unitOptions = getUnitOptionsForType(instrumentType);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Photo must be less than 5MB.");
        return;
      }
      setSelectedPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!manufacturer.trim() || !modelName.trim() || !serialNumber.trim() || !location.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const formattedCapacity =
        minCapacity.trim() || maxCapacity.trim()
          ? `${minCapacity.trim() || "0"} - ${maxCapacity.trim()} ${capacityUnit}`.trim()
          : undefined;

      const created = await createInstrument({
        instrument_type: instrumentType,
        manufacturer: manufacturer.trim(),
        model_name: modelName.trim(),
        serial_number: serialNumber.trim(),
        capacity: formattedCapacity,
        min_capacity: minCapacity.trim() || undefined,
        max_capacity: maxCapacity.trim() || undefined,
        capacity_unit: capacityUnit,
        location: location.trim(),
        tac_certificate_url: tacUrl.trim() || undefined,
        purchase_invoice_url: invoiceUrl.trim() || undefined,
      }).unwrap();

      if (selectedPhoto && created.id) {
        try {
          await uploadImage({ id: created.id, file: selectedPhoto }).unwrap();
        } catch (uploadErr) {
          console.warn("Photo upload failed:", uploadErr);
        }
      }

      onSuccess(created);
      onClose();
    } catch (err: unknown) {
      setError((err as { data?: { detail?: string } })?.data?.detail || "Failed to register instrument.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Register New Instrument</h2>
            <p className="text-[11px] text-slate-400">Specifications, TAC & purchase dossier</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-2.5 rounded-lg bg-rose-50 border border-rose-200 p-2 text-xs text-rose-700">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="mt-3 space-y-2.5 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-0.5">Instrument Type *</label>
            <select
              value={instrumentType}
              onChange={(e) => handleTypeChange(e.target.value as InstrumentType)}
              className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500"
            >
              {INSTRUMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-medium text-slate-700 mb-0.5">Manufacturer *</label>
              <input
                type="text"
                required
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g. Essae-Teraoka"
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-0.5">Model Name *</label>
              <input
                type="text"
                required
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="e.g. DS-215"
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-medium text-slate-700 mb-0.5">Serial Number *</label>
              <input
                type="text"
                required
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="e.g. SN-88201-MH"
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-0.5">Operating Location *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Warehouse 3, Bay 4, Pune"
                className="w-full rounded-lg border border-slate-200 px-3 py-1.5 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-2.5">
            <span className="block font-semibold text-slate-700 text-[10px] uppercase mb-1">Capacity Range & Unit</span>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                value={minCapacity}
                onChange={(e) => setMinCapacity(e.target.value)}
                placeholder="Min (e.g. 50)"
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
              />
              <input
                type="text"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(e.target.value)}
                placeholder="Max (e.g. 500)"
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs"
              />
              <select
                value={capacityUnit}
                onChange={(e) => setCapacityUnit(e.target.value)}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-emerald-700"
              >
                {unitOptions.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Statutory Verification Dossier: TAC and Invoice */}
          <div className="rounded-xl border border-slate-200 bg-emerald-50/40 p-2.5 space-y-2">
            <span className="block font-semibold text-emerald-900 text-[10px] uppercase">
              Statutory Compliance Dossier (LM Rules)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-600 mb-0.5">TAC Approval Doc / URL</label>
                <input
                  type="text"
                  value={tacUrl}
                  onChange={(e) => setTacUrl(e.target.value)}
                  placeholder="https://... or TAC/IND/2026/..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-0.5">Purchase Invoice URL / No.</label>
                <input
                  type="text"
                  value={invoiceUrl}
                  onChange={(e) => setInvoiceUrl(e.target.value)}
                  placeholder="https://... or INV-2026-..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Device Photo */}
          <div>
            <label className="block font-medium text-slate-700 mb-1">Instrument Photograph</label>
            {photoPreview ? (
              <div className="relative aspect-video max-h-28 rounded-lg overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => { setSelectedPhoto(null); setPhotoPreview(null); }}
                  className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/70 text-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <label className="border border-dashed border-slate-300 hover:border-emerald-500 rounded-lg p-2.5 flex items-center justify-center gap-2 cursor-pointer bg-slate-50 hover:bg-emerald-50/20">
                <Camera className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-600 text-xs">Add device photo (JPG/PNG &lt; 5MB)</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoSelect}
                  className="sr-only"
                />
              </label>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              {isLoading ? "Registering..." : "Register Instrument"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
