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
  tac_certificate_url?: string;
  purchase_invoice_url?: string;
}

export const INSTRUMENT_TYPES: { label: string; value: InstrumentType }[] = [
  { label: "Weighing Scale", value: "WEIGHING_SCALE" },
  { label: "Electronic Balance", value: "ELECTRONIC_BALANCE" },
  { label: "Platform Scale", value: "PLATFORM_SCALE" },
  { label: "Weighbridge (Vehicle / Industrial)", value: "WEIGHBRIDGE" },
  { label: "Counter Machine", value: "COUNTER_MACHINE" },
  { label: "Precision / Analytical Balance", value: "PRECISION_BALANCE" },
  { label: "Petrol / Fuel Dispenser", value: "PETROL_DISPENSER" },
  { label: "Flow Meter (Industrial)", value: "FLOW_METER" },
  { label: "Tank Lorry / Road Tanker", value: "TANK_LORRY" },
  { label: "Storage Tank (Calibrated)", value: "STORAGE_TANK" },
  { label: "Water Meter", value: "WATER_METER" },
  { label: "Gas Meter", value: "GAS_METER" },
  { label: "Fare Meter (Taxi / Auto-Rickshaw)", value: "FARE_METER" },
  { label: "Energy Meter (Static / Smart)", value: "ENERGY_METER" },
  { label: "Length Measure (Tape / Rule)", value: "LENGTH_MEASURE" },
  { label: "Clinical Thermometer", value: "CLINICAL_THERMOMETER" },
  { label: "Breath Alcohol Analyzer", value: "BREATH_ALCOHOL_ANALYZER" },
  { label: "Other Measuring Instrument", value: "OTHER" },
];

export function getUnitOptionsForType(instrumentType: InstrumentType) {
  if (
    instrumentType === "WEIGHING_SCALE" ||
    instrumentType === "ELECTRONIC_BALANCE" ||
    instrumentType === "PLATFORM_SCALE" ||
    instrumentType === "WEIGHBRIDGE" ||
    instrumentType === "COUNTER_MACHINE" ||
    instrumentType === "PRECISION_BALANCE"
  ) {
    return [
      { label: "kg", value: "kg" },
      { label: "g", value: "g" },
      { label: "mg", value: "mg" },
      { label: "tonne", value: "tonne" },
    ];
  }
  if (
    instrumentType === "PETROL_DISPENSER" ||
    instrumentType === "FLOW_METER" ||
    instrumentType === "TANK_LORRY" ||
    instrumentType === "STORAGE_TANK" ||
    instrumentType === "WATER_METER"
  ) {
    return [
      { label: "L", value: "L" },
      { label: "kL", value: "kL" },
      { label: "mL", value: "mL" },
      { label: "m³", value: "m3" },
    ];
  }
  if (instrumentType === "GAS_METER") {
    return [
      { label: "m³", value: "m3" },
      { label: "ft³", value: "ft3" },
    ];
  }
  if (instrumentType === "FARE_METER") {
    return [
      { label: "km", value: "km" },
      { label: "meter", value: "m" },
    ];
  }
  if (instrumentType === "ENERGY_METER") {
    return [
      { label: "kWh", value: "kWh" },
      { label: "MWh", value: "MWh" },
    ];
  }
  if (instrumentType === "CLINICAL_THERMOMETER") {
    return [
      { label: "°C", value: "degC" },
      { label: "°F", value: "degF" },
    ];
  }
  if (instrumentType === "BREATH_ALCOHOL_ANALYZER") {
    return [{ label: "mg/L", value: "mg/L" }, { label: "% BAC", value: "BAC" }];
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
