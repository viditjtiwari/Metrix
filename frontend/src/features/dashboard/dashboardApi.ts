import { baseApi } from "@/services/api";
import { DashboardSummaryResponse } from "@/types";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query<DashboardSummaryResponse, void>({
      query: () => "/dashboard/summary",
      providesTags: ["Dashboard"],
    }),
    getDashboardCharts: builder.query<Record<string, any>, void>({
      query: () => "/dashboard/charts",
      providesTags: ["Dashboard"],
    }),
  }),
});

export const { useGetDashboardSummaryQuery, useGetDashboardChartsQuery } = dashboardApi;
