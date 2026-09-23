import { baseApi } from "@/services/api";
import { NoticeCreateRequest, NoticeListResponse, NoticeResponse } from "@/types/notice";

export const noticeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotices: builder.query<NoticeListResponse, { limit?: number } | void>({
      query: (args) => {
        const limit = args?.limit ?? 10;
        return `/notices?limit=${limit}`;
      },
      providesTags: ["Notices"],
    }),
    createNotice: builder.mutation<NoticeResponse, NoticeCreateRequest>({
      query: (body) => ({
        url: "/notices",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notices"],
    }),
    deleteNotice: builder.mutation<void, number>({
      query: (id) => ({
        url: `/notices/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notices"],
    }),
  }),
});

export const {
  useGetNoticesQuery,
  useCreateNoticeMutation,
  useDeleteNoticeMutation,
} = noticeApi;
