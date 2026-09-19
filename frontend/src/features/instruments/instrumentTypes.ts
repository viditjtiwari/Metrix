import { InstrumentType, InstrumentResponse } from "@/types";

export type Instrument = InstrumentResponse;

export interface InstrumentCreateRequest {
  instrument_type: InstrumentType;
  manufacturer: string;
  model_name: string;
  serial_number: string;
  capacity?: string;
  location: string;
}
