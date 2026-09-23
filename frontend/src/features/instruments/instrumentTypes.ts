import { InstrumentType, InstrumentResponse } from "@/types";

export type Instrument = InstrumentResponse;

export interface InstrumentCreateRequest {
  instrument_type: InstrumentType;
  manufacturer: string;
  model_name: string;
  serial_number: string;
  capacity?: string;
  min_capacity?: string;
  max_capacity?: string;
  capacity_unit?: string;
  location: string;
}

export const INSTRUMENT_TYPES: { label: string; value: InstrumentType }[] = [
  { label: "Weighing Scale", value: "WEIGHING_SCALE" },
  { label: "Electronic Balance", value: "ELECTRONIC_BALANCE" },
  { label: "Petrol Dispenser", value: "PETROL_DISPENSER" },
  { label: "Flow Meter", value: "FLOW_METER" },
  { label: "Length Measure", value: "LENGTH_MEASURE" },
  { label: "Other", value: "OTHER" },
];

export function getUnitOptionsForType(instrumentType: InstrumentType) {
  if (instrumentType === "WEIGHING_SCALE" || instrumentType === "ELECTRONIC_BALANCE") {
    return [
      { label: "kg", value: "kg" },
      { label: "g", value: "g" },
      { label: "mg", value: "mg" },
      { label: "tonne", value: "tonne" },
    ];
  }
  if (instrumentType === "PETROL_DISPENSER" || instrumentType === "FLOW_METER") {
    return [
      { label: "L", value: "L" },
      { label: "mL", value: "mL" },
      { label: "kL", value: "kL" },
    ];
  }
  if (instrumentType === "LENGTH_MEASURE") {
    return [
      { label: "m", value: "m" },
      { label: "cm", value: "cm" },
      { label: "mm", value: "mm" },
    ];
  }
  return [
    { label: "kg", value: "kg" },
    { label: "L", value: "L" },
    { label: "units", value: "units" },
  ];
}
