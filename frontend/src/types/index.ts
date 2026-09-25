export * from "./domain";
export * from "./checklist";

export interface HealthStatus {
  status: "ok" | "degraded";
  environment: string;
  version: string;
  database: "connected" | "disconnected";
  details?: string | null;
}

export type UserRole = "ADMIN" | "LMO" | "GATC" | "INSTRUMENT_OWNER";

export interface StakeholderProfile {
  id: number;
  user_id: number;
  business_name: string;
  trade_license_number?: string | null;
  contact_phone: string;
  address_line: string;
  city: string;
  state: string;
  pincode: string;
  gstin?: string | null;
  pan?: string | null;
  business_type?: string | null;
  aadhaar_reference?: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  is_active: boolean;
  auth_provider?: string;
  profile?: StakeholderProfile | null;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  full_name: string;
  role?: UserRole;
  profile?: {
    business_name: string;
    trade_license_number?: string;
    contact_phone: string;
    address_line: string;
    city: string;
    state: string;
    pincode: string;
    gstin?: string;
    pan?: string;
    business_type?: string;
    aadhaar_reference?: string;
  };
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// OTP Login
export interface OTPSendRequest {
  email: string;
}

export interface OTPVerifyRequest {
  email: string;
  otp_code: string;
}

// Google OAuth
export interface GoogleAuthRequest {
  code: string;
}

export interface GoogleAuthURLResponse {
  auth_url: string;
}

// Admin Role Update
export interface UserRoleUpdateRequest {
  role: UserRole;
}

export interface DashboardSummaryResponse {
  role: UserRole;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metrics: Record<string, any>;
}
