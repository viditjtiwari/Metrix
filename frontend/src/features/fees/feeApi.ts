import { baseApi } from "@/services/api";
import { InstrumentType } from "@/types";

export interface FeeCalculationResponse {
  instrument_type: InstrumentType;
  base_fee: number;
  late_fee: number;
  total_fee: number;
  quarters_delayed: number;
  is_late: boolean;
  breakdown_notes: string;
  currency: string;
}

export interface FeeCalculationParams {
  instrument_type: InstrumentType;
  capacity?: string;
  capacity_unit?: string;
  verification_type?: string;
  previous_expiry_date?: string;
}

export const feeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    calculateFee: builder.query<FeeCalculationResponse, FeeCalculationParams>({
      query: (params) => {
        const queryParams = new URLSearchParams();
        queryParams.append("instrument_type", params.instrument_type);
        if (params.capacity) queryParams.append("capacity", params.capacity);
        if (params.capacity_unit) queryParams.append("capacity_unit", params.capacity_unit);
        if (params.verification_type) queryParams.append("verification_type", params.verification_type);
        if (params.previous_expiry_date) queryParams.append("previous_expiry_date", params.previous_expiry_date);
        return `/fees/calculate?${queryParams.toString()}`;
      },
    }),
  }),
});

export const { useCalculateFeeQuery, useLazyCalculateFeeQuery } = feeApi;
