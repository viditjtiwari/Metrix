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

    searchCertificates: builder.query<
      { items: CertificateDetailResponse[]; total: number; page: number; page_size: number },
      { certificate_number?: string; status?: string; page?: number; page_size?: number } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params && params.certificate_number) {
          queryParams.append("certificate_number", params.certificate_number);
        }
        if (params && params.status) {
          queryParams.append("status", params.status);
        }
        if (params && params.page) {
          queryParams.append("page", String(params.page));
        }
        if (params && params.page_size) {
          queryParams.append("page_size", String(params.page_size));
        }
        const qs = queryParams.toString();
        return `/certificates${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Certificates"],
    }),

    getExpiringCertificates: builder.query<
      { items: CertificateDetailResponse[]; total: number; page: number; page_size: number },
      { page?: number; page_size?: number } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params && params.page) queryParams.append("page", String(params.page));
        if (params && params.page_size) queryParams.append("page_size", String(params.page_size));
        const qs = queryParams.toString();
        return `/certificates/expiring${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Certificates"],
    }),

    getExpiredCertificates: builder.query<
      { items: CertificateDetailResponse[]; total: number; page: number; page_size: number },
      { page?: number; page_size?: number } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params && params.page) queryParams.append("page", String(params.page));
        if (params && params.page_size) queryParams.append("page_size", String(params.page_size));
        const qs = queryParams.toString();
        return `/certificates/expired${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Certificates"],
    }),

    downloadCertificate: builder.mutation<Blob, number>({
      query: (certificateId) => ({
        url: `/certificates/${certificateId}/download`,
        responseHandler: (response: Response) => response.blob(),
      }),
    }),
  }),
});

export const {
  useGetApplicationCertificateQuery,
  useGetCertificateQuery,
  useIssueCertificateMutation,
  useVerifyPublicCertificateQuery,
  useSearchCertificatesQuery,
  useGetExpiringCertificatesQuery,
  useGetExpiredCertificatesQuery,
  useDownloadCertificateMutation,
} = certificateApi;

export const useListExpiringCertificatesQuery = certificateApi.endpoints.getExpiringCertificates.useQuery;
export const useListCertificatesQuery = certificateApi.endpoints.searchCertificates.useQuery;
