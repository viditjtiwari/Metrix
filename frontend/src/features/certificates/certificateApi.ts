import { baseApi } from "@/services/api";
import {
  CertificateDetailResponse,
  CertificateIssueRequest,
  PublicCertificateVerificationResponse,
} from "@/types";

export const certificateApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getApplicationCertificate: builder.query<CertificateDetailResponse, number>({
      query: (applicationId) => `/applications/${applicationId}/certificate`,
      providesTags: (_res, _err, applicationId) => [
        { type: "Certificates", id: applicationId },
      ],
    }),

    getCertificate: builder.query<CertificateDetailResponse, number>({
      query: (certificateId) => `/certificates/${certificateId}`,
      providesTags: (_res, _err, certificateId) => [
        { type: "Certificates", id: certificateId },
      ],
    }),

    issueCertificate: builder.mutation<
      CertificateDetailResponse,
      { applicationId: number; data?: CertificateIssueRequest }
    >({
      query: ({ applicationId, data }) => ({
        url: `/applications/${applicationId}/certificate`,
        method: "POST",
        body: data || {},
      }),
      invalidatesTags: (_res, _err, { applicationId }) => [
        { type: "Certificates", id: applicationId },
        { type: "Applications", id: applicationId },
        "Applications",
        "Certificates",
      ],
    }),

    verifyPublicCertificate: builder.query<
      PublicCertificateVerificationResponse,
      string
    >({
      query: (token) => `/public/certificates/verify/${encodeURIComponent(token)}`,
    }),
  }),
});

export const {
  useGetApplicationCertificateQuery,
  useGetCertificateQuery,
  useIssueCertificateMutation,
  useVerifyPublicCertificateQuery,
} = certificateApi;
