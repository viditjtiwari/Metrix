import { baseApi } from "@/services/api";

export interface DiscrepancyReport {
  id: number;
  report_reference_id: string;
  certificate_id: number;
  certificate_number: string | null;
  discrepancy_type: string;
  description: string;
  reporter_name: string | null;
  reporter_phone: string | null;
  evidence_image_url: string | null;
  status: string;
  reviewed_by_id: number | null;
  reviewed_by_name: string | null;
  action_remarks: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

interface DiscrepancyReportListResponse {
  items: DiscrepancyReport[];
  total: number;
  page: number;
  page_size: number;
}

interface ActionRequest {
  id: number;
  data: { status: string; action_remarks?: string };
}

export const discrepancyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDiscrepancyReports: builder.query<
      DiscrepancyReportListResponse,
      { status?: string; page?: number; page_size?: number }
    >({
      query: ({ status, page = 1, page_size = 20 }) => {
        const params = new URLSearchParams();
        if (status) params.set("status", status);
        params.set("page", String(page));
        params.set("page_size", String(page_size));
        return `/discrepancy-reports?${params.toString()}`;
      },
      providesTags: ["DiscrepancyReports"],
    }),

    actionDiscrepancyReport: builder.mutation<DiscrepancyReport, ActionRequest>(
      {
        query: ({ id, data }) => ({
          url: `/discrepancy-reports/${id}/action`,
          method: "PATCH",
          body: data,
        }),
        invalidatesTags: ["DiscrepancyReports"],
      }
    ),
  }),
});

export const {
  useGetDiscrepancyReportsQuery,
  useActionDiscrepancyReportMutation,
} = discrepancyApi;
