import { baseApi } from "@/services/api";
import {
  InspectionDetailResponse,
  InspectionListResponse,
  InspectionResult,
  ObservationCreate,
  User,
} from "@/types";

export interface ListInspectionsParams {
  verifier_id?: number;
  application_id?: number;
  result?: InspectionResult;
  scheduled_date_from?: string;
  scheduled_date_to?: string;
  page?: number;
  page_size?: number;
}

export interface GATCReportSubmitData {
  gatc_test_report_url: string;
  gatc_recommendation: "CERTIFY" | "REJECT" | string;
  observations?: ObservationCreate[];
}

export interface LMOApprovalSubmitData {
  lmo_approval_status: "APPROVED" | "REJECTED" | "CLARIFICATION_ASKED" | string;
  lmo_approval_remarks?: string;
}

export const inspectionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listInspections: builder.query<InspectionListResponse, ListInspectionsParams | void>({
      query: (params) => ({
        url: "/inspections",
        params: params || {},
      }),
      providesTags: ["Inspections"],
    }),

    getInspectionById: builder.query<InspectionDetailResponse, number>({
      query: (id) => `/inspections/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Inspections", id }],
    }),

    getVerifiersList: builder.query<User[], void>({
      query: () => "/inspections/verifiers",
    }),

    submitGATCReport: builder.mutation<
      InspectionDetailResponse,
      { inspectionId: number; data: GATCReportSubmitData }
    >({
      query: ({ inspectionId, data }) => ({
        url: `/inspections/${inspectionId}/gatc-report`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Inspections", "Applications"],
    }),

    reviewGATCReport: builder.mutation<
      InspectionDetailResponse,
      { inspectionId: number; data: LMOApprovalSubmitData }
    >({
      query: ({ inspectionId, data }) => ({
        url: `/inspections/${inspectionId}/lmo-approval`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Inspections", "Applications"],
    }),
  }),
});

export const {
  useListInspectionsQuery,
  useGetInspectionByIdQuery,
  useGetVerifiersListQuery,
  useSubmitGATCReportMutation,
  useReviewGATCReportMutation,
} = inspectionApi;
