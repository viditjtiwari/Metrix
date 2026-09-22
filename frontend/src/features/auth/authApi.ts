import { baseApi } from "@/services/api";
import {
  AuthResponse,
  GoogleAuthRequest,
  GoogleAuthURLResponse,
  LoginCredentials,
  OTPSendRequest,
  OTPVerifyRequest,
  RegisterCredentials,
  User,
  UserRoleUpdateRequest,
} from "@/types";

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

    // OTP Login
    sendOtp: builder.mutation<{ message: string }, OTPSendRequest>({
      query: (data) => ({
        url: "/auth/otp/send",
        method: "POST",
        body: data,
      }),
    }),
    verifyOtp: builder.mutation<AuthResponse, OTPVerifyRequest>({
      query: (data) => ({
        url: "/auth/otp/verify",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),

    // Google OAuth
    getGoogleUrl: builder.query<GoogleAuthURLResponse, void>({
      query: () => "/auth/google/url",
    }),
    googleAuth: builder.mutation<AuthResponse, GoogleAuthRequest>({
      query: (data) => ({
        url: "/auth/google",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Auth"],
    }),

    // Profile
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

    // Admin Role Update
    updateUserRole: builder.mutation<User, { userId: number; data: UserRoleUpdateRequest }>({
      query: ({ userId, data }) => ({
        url: `/admin/users/${userId}/role`,
        method: "PATCH",
        body: data,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useSendOtpMutation,
  useVerifyOtpMutation,
  useGetGoogleUrlQuery,
  useLazyGetGoogleUrlQuery,
  useGoogleAuthMutation,
  useGetMeQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useUpdateUserRoleMutation,
} = authApi;
