import { baseApi } from "@/services/api";
import { InstrumentListResponse, InstrumentType } from "@/types";

export const instrumentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchInstruments: builder.query<
      InstrumentListResponse,
      {
        registration_number?: string;
        serial_number?: string;
        instrument_type?: InstrumentType;
        manufacturer?: string;
        location?: string;
        owner_id?: number;
        page?: number;
        page_size?: number;
      } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params) {
          if (params.registration_number) queryParams.append("registration_number", params.registration_number);
          if (params.serial_number) queryParams.append("serial_number", params.serial_number);
          if (params.instrument_type) queryParams.append("instrument_type", params.instrument_type);
          if (params.manufacturer) queryParams.append("manufacturer", params.manufacturer);
          if (params.location) queryParams.append("location", params.location);
          if (params.owner_id) queryParams.append("owner_id", String(params.owner_id));
          if (params.page) queryParams.append("page", String(params.page));
          if (params.page_size) queryParams.append("page_size", String(params.page_size));
        }
        const qs = queryParams.toString();
        return `/instruments${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Instruments"],
    }),
  }),
});

export const { useSearchInstrumentsQuery } = instrumentApi;
