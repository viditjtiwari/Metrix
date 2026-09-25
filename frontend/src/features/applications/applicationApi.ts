import { baseApi } from "@/services/api";
import {
  ApplicationDetailResponse,
  ApplicationListResponse,
  ApplicationResponse,
  ApplicationStatus,
  AssignmentRequest,
  InspectionChecklistSubmit,
  InspectionDetailResponse,
  InspectionResultUpdate,
  ObservationCreate,
  ObservationResponse,
  ScheduleRequest,
  User,
} from "@/types";
import { ApplicationCreateRequest } from "./applicationTypes";

export const applicationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getApplications: builder.query<
      ApplicationListResponse,
      { status?: ApplicationStatus; application_number?: string; instrument_id?: number; page?: number; pageSize?: number; page_size?: number } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.status) queryParams.append("status", params.status);
        if (params?.application_number) queryParams.append("application_number", params.application_number);
        if (params?.instrument_id) queryParams.append("instrument_id", String(params.instrument_id));
        if (params?.page) queryParams.append("page", params.page.toString());
        const ps = params?.page_size || params?.pageSize;
        if (ps) queryParams.append("page_size", ps.toString());
        const qs = queryParams.toString();
        return `/applications${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Applications"],
    }),

    getApplication: builder.query<ApplicationDetailResponse, number>({
      query: (id) => `/applications/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Applications", id }],
    }),

    updateApplicationStatus: builder.mutation<
      ApplicationDetailResponse,
      { id: number; status: ApplicationStatus; remarks?: string }
    >({
      query: ({ id, status, remarks }) => ({
        url: `/applications/${id}/status`,
        method: "PATCH",
        body: { status, remarks },
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Applications", id },
        "Applications",
      ],
    }),

    scheduleInspection: builder.mutation<
      InspectionDetailResponse,
      { id: number; data: ScheduleRequest }
    >({
      query: ({ id, data }) => ({
        url: `/applications/${id}/schedule`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Applications", id },
        "Applications",
        "Inspections",
      ],
    }),

    assignVerifier: builder.mutation<
      InspectionDetailResponse,
      { id: number; data: AssignmentRequest }
    >({
      query: ({ id, data }) => ({
        url: `/applications/${id}/assignment`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Applications", id },
        "Applications",
        "Inspections",
      ],
    }),

    startInspection: builder.mutation<InspectionDetailResponse, number>({
      query: (id) => ({
        url: `/applications/${id}/inspection`,
        method: "POST",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Applications", id },
        "Applications",
        "Inspections",
      ],
    }),

    getApplicationInspection: builder.query<InspectionDetailResponse, number>({
      query: (id) => `/applications/${id}/inspection`,
      providesTags: (_res, _err, id) => [{ type: "Inspections", id }],
    }),

    getVerifiers: builder.query<User[], void>({
      query: () => `/inspections/verifiers`,
    }),

    addObservation: builder.mutation<
      ObservationResponse,
      { inspectionId: number; data: ObservationCreate; applicationId?: number }
    >({
      query: ({ inspectionId, data }) => ({
        url: `/inspections/${inspectionId}/observations`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_res, _err, { inspectionId, applicationId }) => [
        { type: "Inspections", id: applicationId ?? inspectionId },
        "Inspections",
      ],
    }),

    getObservations: builder.query<ObservationResponse[], number>({
      query: (inspectionId) => `/inspections/${inspectionId}/observations`,
      providesTags: (_res, _err, id) => [{ type: "Inspections", id }],
    }),

    submitInspectionResult: builder.mutation<
      InspectionDetailResponse,
      { inspectionId: number; data: InspectionResultUpdate; applicationId?: number }
    >({
      query: ({ inspectionId, data }) => ({
        url: `/inspections/${inspectionId}/result`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_res, _err, { inspectionId, applicationId }) => [
        { type: "Applications", id: applicationId },
        "Applications",
        { type: "Inspections", id: inspectionId },
        "Inspections",
      ],
    }),

    submitInspectionChecklist: builder.mutation<
      InspectionDetailResponse,
      { inspectionId: number; data: InspectionChecklistSubmit; applicationId?: number }
    >({
      query: ({ inspectionId, data }) => ({
        url: `/inspections/${inspectionId}/checklist`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_res, _err, { inspectionId, applicationId }) => [
        { type: "Applications", id: applicationId },
        "Applications",
        { type: "Inspections", id: inspectionId },
        "Inspections",
      ],
    }),

    createApplication: builder.mutation<
      ApplicationResponse,
      ApplicationCreateRequest
    >({
      query: (data) => ({
        url: "/applications",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Applications"],
    }),

    deleteApplication: builder.mutation<{ success: boolean; message?: string }, number>({
      query: (id) => ({
        url: `/applications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Applications"],
    }),

    uploadInspectionImage: builder.mutation<string[], { inspectionId: number; file: File }>({
      query: ({ inspectionId, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: `/inspections/${inspectionId}/images`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Inspections"],
    }),

    selectCertificateImage: builder.mutation<{ certificate_image_url: string }, { inspectionId: number; imageUrl: string }>({
      query: ({ inspectionId, imageUrl }) => ({
        url: `/inspections/${inspectionId}/certificate-image`,
        method: "PATCH",
        body: { image_url: imageUrl },
      }),
      invalidatesTags: ["Inspections"],
    }),

    uploadPaymentReceipt: builder.mutation<
      ApplicationDetailResponse,
      { id: number; data: { challan_reference_number: string; challan_date?: string; payment_receipt_url: string; calculated_fee?: number; late_fee?: number; total_fee?: number } }
    >({
      query: ({ id, data }) => ({
        url: `/applications/${id}/payment-receipt`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: "Applications", id }, "Applications"],
    }),

    verifyPayment: builder.mutation<
      ApplicationDetailResponse,
      { id: number; data: { is_verified: boolean; remarks?: string } }
    >({
      query: ({ id, data }) => ({
        url: `/applications/${id}/payment-verify`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Applications", id },
        "Applications",
      ],
    }),

    requestClarification: builder.mutation<
      ApplicationDetailResponse,
      { id: number; data: { remarks: string } }
    >({
      query: ({ id, data }) => ({
        url: `/applications/${id}/clarification/request`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Applications", id },
        "Applications",
      ],
    }),

    respondClarification: builder.mutation<
      ApplicationDetailResponse,
      { id: number; data: { remarks: string } }
    >({
      query: ({ id, data }) => ({
        url: `/applications/${id}/clarification/respond`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "Applications", id },
        "Applications",
      ],
    }),
  }),
});

export const {
  useGetApplicationsQuery,
  useGetApplicationQuery,
  useCreateApplicationMutation,
  useUpdateApplicationStatusMutation,
  useScheduleInspectionMutation,
  useAssignVerifierMutation,
  useStartInspectionMutation,
  useGetApplicationInspectionQuery,
  useGetVerifiersQuery,
  useAddObservationMutation,
  useGetObservationsQuery,
  useSubmitInspectionResultMutation,
  useSubmitInspectionChecklistMutation,
  useDeleteApplicationMutation,
  useUploadInspectionImageMutation,
  useSelectCertificateImageMutation,
  useUploadPaymentReceiptMutation,
  useVerifyPaymentMutation,
  useRequestClarificationMutation,
  useRespondClarificationMutation,
} = applicationApi;

export const useListApplicationsQuery = applicationApi.endpoints.getApplications.useQuery;
