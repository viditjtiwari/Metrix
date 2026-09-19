"use client";

import React, { useState } from "react";
import { useCreateInstrumentMutation } from "./instrumentApi";
import { InstrumentType } from "@/types";
import { Instrument } from "./instrumentTypes";

interface RegisterInstrumentModalProps {
  onClose: () => void;
  onSuccess: (instrument: Instrument) => void;
}

const INSTRUMENT_TYPES: { label: string; value: InstrumentType }[] = [
  { label: "Weighing Scale", value: "WEIGHING_SCALE" },
  { label: "Electronic Balance", value: "ELECTRONIC_BALANCE" },
  { label: "Petrol Dispenser", value: "PETROL_DISPENSER" },
  { label: "Flow Meter", value: "FLOW_METER" },
  { label: "Length Measure", value: "LENGTH_MEASURE" },
  { label: "Other", value: "OTHER" },
];

export const RegisterInstrumentModal: React.FC<RegisterInstrumentModalProps> = ({
  onClose,
  onSuccess,
}) => {
  const [instrumentType, setInstrumentType] = useState<InstrumentType>("WEIGHING_SCALE");
  const [manufacturer, setManufacturer] = useState("");
  const [modelName, setModelName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [createInstrument, { isLoading }] = useCreateInstrumentMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!manufacturer.trim() || !modelName.trim() || !serialNumber.trim() || !location.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      const created = await createInstrument({
        instrument_type: instrumentType,
        manufacturer: manufacturer.trim(),
        model_name: modelName.trim(),
        serial_number: serialNumber.trim(),
        capacity: capacity.trim() || undefined,
        location: location.trim(),
      }).unwrap();

      onSuccess(created);
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { data?: { detail?: string } })?.data?.detail ||
        "Failed to register instrument. Please verify input data.";
      setError(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-900">
            Register Instrument
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-lg leading-none"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mt-3 rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-xs text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Instrument Type <span className="text-rose-500">*</span>
            </label>
            <select
              value={instrumentType}
              onChange={(e) => setInstrumentType(e.target.value as InstrumentType)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              {INSTRUMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Manufacturer <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g. Avery Weigh-Tronix"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Model Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                placeholder="e.g. ZM510"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Serial Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="e.g. SN-88201-A"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Capacity
              </label>
              <input
                type="text"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                placeholder="e.g. 500 kg x 50 g"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Installation / Operating Location <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Warehouse 3, Bay 4, Industrial Area"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {isLoading ? "Registering..." : "Register Instrument"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
