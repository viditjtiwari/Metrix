"use client";

import React, { useState } from "react";
import { useCreateInstrumentMutation } from "./instrumentApi";
import { InstrumentType } from "@/types";
import { Instrument } from "./instrumentTypes";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

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
    <Modal
      title="Register Instrument"
      subtitle="Enroll weighing or measuring equipment into the National Metrology Registry."
      onClose={onClose}
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
            Register Instrument
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="rounded-xl bg-error-container p-3 text-xs text-on-error-container">
            {error}
          </div>
        )}

        <Select
          label="Instrument Type *"
          value={instrumentType}
          onChange={(e) => setInstrumentType(e.target.value as InstrumentType)}
          options={INSTRUMENT_TYPES.map((t) => ({ value: t.value, label: t.label }))}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Manufacturer *"
            required
            value={manufacturer}
            onChange={(e) => setManufacturer(e.target.value)}
            placeholder="e.g. Avery Weigh-Tronix"
          />
          <Input
            label="Model Name *"
            required
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            placeholder="e.g. ZM510"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Serial Number *"
            required
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            placeholder="e.g. SN-88201-A"
          />
          <Input
            label="Capacity / Range"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="e.g. 500 kg x 50 g"
          />
        </div>

        <Input
          label="Installation / Operating Location *"
          required
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g. Warehouse 3, Bay 4, Industrial Area"
        />
      </form>
    </Modal>
  );
};
