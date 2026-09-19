import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { HealthStatus } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as { auth?: { token?: string | null } };
      const token =
        state.auth?.token ||
        (typeof window !== "undefined"
          ? localStorage.getItem("metrix_token")
          : null);

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Health", "Auth", "Instruments", "Applications", "Certificates", "Inspections", "Notifications", "Dashboard"],
  endpoints: (builder) => ({
    getHealth: builder.query<HealthStatus, void>({
      query: () => "/health",
      providesTags: ["Health"],
    }),
  }),
});

export const { useGetHealthQuery } = baseApi;
