import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { HealthStatus } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      // Future: add auth token from state/storage
      return headers;
    },
  }),
  tagTypes: ["Health", "Instruments", "Applications", "Certificates"],
  endpoints: (builder) => ({
    getHealth: builder.query<HealthStatus, void>({
      query: () => "/health",
      providesTags: ["Health"],
    }),
  }),
});

export const { useGetHealthQuery } = baseApi;
