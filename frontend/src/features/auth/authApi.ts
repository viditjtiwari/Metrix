import { baseApi } from "@/services/api";
import { AuthResponse, LoginCredentials, RegisterCredentials, User } from "@/types";

export interface ProfileUpdateRequest {
  full_name?: string;
  business_name?: string;
  trade_license_number?: string;
  contact_phone?: string;
  address_line?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface PasswordChangeRequest {
  current_password: string;
  new_password: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginCredentials>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),
    register: builder.mutation<User, RegisterCredentials>({
      query: (userData) => ({
        url: "/auth/register",
        method: "POST",
        body: userData,
      }),
    }),
    getMe: builder.query<User, void>({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),
    updateProfile: builder.mutation<User, ProfileUpdateRequest>({
      query: (data) => ({
        url: "/auth/me",
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),
    changePassword: builder.mutation<{ message: string }, PasswordChangeRequest>({
      query: (data) => ({
        url: "/auth/me/password",
        method: "PATCH",
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = authApi;
