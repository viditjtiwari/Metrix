import { baseApi } from "@/services/api";
import { UserRole } from "@/types";

export interface AdminUserItem {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  profile?: {
    business_name: string;
    trade_license_number?: string;
    contact_phone: string;
    city: string;
    state: string;
  } | null;
}

export interface AdminUserListResponse {
  items: AdminUserItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface AdminUserCreateRequest {
  email: string;
  password: string;
  full_name: string;
  role: "LMO" | "GATC" | "ADMIN";
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listUsers: builder.query<
      AdminUserListResponse,
      {
        query?: string;
        role?: string;
        is_active?: boolean;
        page?: number;
        page_size?: number;
      } | void
    >({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params?.query) queryParams.append("query", params.query);
        if (params?.role) queryParams.append("role", params.role);
        if (params?.is_active !== undefined) queryParams.append("is_active", String(params.is_active));
        if (params?.page) queryParams.append("page", String(params.page));
        if (params?.page_size) queryParams.append("page_size", String(params.page_size));
        const qs = queryParams.toString();
        return `/admin/users${qs ? `?${qs}` : ""}`;
      },
      providesTags: ["AdminUsers" as any],
    }),

    getUser: builder.query<AdminUserItem, number>({
      query: (id) => `/admin/users/${id}`,
      providesTags: (_res, _err, id) => [{ type: "AdminUsers" as any, id }],
    }),

    updateUserStatus: builder.mutation<AdminUserItem, { id: number; is_active: boolean }>({
      query: ({ id, is_active }) => ({
        url: `/admin/users/${id}/status`,
        method: "PATCH",
        body: { is_active },
      }),
      invalidatesTags: ["AdminUsers" as any],
    }),

    createOfficialUser: builder.mutation<AdminUserItem, AdminUserCreateRequest>({
      query: (data) => ({
        url: "/admin/users",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["AdminUsers" as any],
    }),
  }),
});

export const {
  useListUsersQuery,
  useGetUserQuery,
  useUpdateUserStatusMutation,
  useCreateOfficialUserMutation,
} = adminApi;
