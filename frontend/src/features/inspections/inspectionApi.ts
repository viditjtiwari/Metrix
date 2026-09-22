import { baseApi } from "@/services/api";
import {
  InspectionDetailResponse,
  ObservationCreate,
  ObservationResponse,
  InspectionResultUpdate,
} from "@/types";
import { UserResponse } from "./inspectionTypes";

export const inspectionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInspection: builder.query<InspectionDetailResponse, number>({
      query: (id) => `/inspections/${id}`,
      providesTags: (_, __, id) => [{ type: "Inspections", id }],
    }),

    listVerifiers: builder.query<UserResponse[], void>({
      query: () => "/inspections/verifiers",
    }),

    addObservation: builder.mutation<
      ObservationResponse,
      { inspectionId: number; data: ObservationCreate }
    >({
      query: ({ inspectionId, data }) => ({
        url: `/inspections/${inspectionId}/observations`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_, __, { inspectionId }) => [
        { type: "Inspections", id: inspectionId },
      ],
    }),

    listObservations: builder.query<ObservationResponse[], number>({
      query: (inspectionId) => `/inspections/${inspectionId}/observations`,
      providesTags: (_, __, id) => [{ type: "Inspections", id }],
    }),

    recordInspectionResult: builder.mutation<
      InspectionDetailResponse,
      { inspectionId: number; data: InspectionResultUpdate }
    >({
      query: ({ inspectionId, data }) => ({
        url: `/inspections/${inspectionId}/result`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_, __, { inspectionId }) => [
        { type: "Inspections", id: inspectionId },
        "Applications",
      ],
    }),
  }),
});

export const {
  useGetInspectionQuery,
  useListVerifiersQuery,
  useAddObservationMutation,
  useListObservationsQuery,
  useRecordInspectionResultMutation,
} = inspectionApi;
