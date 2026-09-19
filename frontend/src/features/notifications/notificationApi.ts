import { baseApi } from "@/services/api";
import { NotificationListResponse, NotificationResponse } from "@/types";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      NotificationListResponse,
      { is_read?: boolean; page?: number; page_size?: number } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params && params.is_read !== undefined) {
          queryParams.append("is_read", String(params.is_read));
        }
        if (params && params.page) {
          queryParams.append("page", String(params.page));
        }
        if (params && params.page_size) {
          queryParams.append("page_size", String(params.page_size));
        }
        const qs = queryParams.toString();
        return `/notifications${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["Notifications"],
    }),
    markNotificationRead: builder.mutation<NotificationResponse, number>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),
    markAllNotificationsRead: builder.mutation<{ updated_count: number }, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: ["Notifications"],
    }),
    checkExpiries: builder.mutation<
      { expiring_notifications_created: number; expired_notifications_created: number; certificates_marked_expired: number },
      void
    >({
      query: () => ({
        url: "/notifications/check-expiries",
        method: "POST",
      }),
      invalidatesTags: ["Notifications", "Certificates", "Dashboard"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useCheckExpiriesMutation,
} = notificationApi;
