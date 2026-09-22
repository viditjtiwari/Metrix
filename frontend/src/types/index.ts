export interface HealthStatus {
  status: "ok" | "degraded";
  environment: string;
  version: string;
  database: "connected" | "disconnected";
  details?: string | null;
}

export type UserRole = "ADMIN" | "LMO" | "GATC" | "INSTRUMENT_OWNER";

export type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "SCHEDULED"
  | "INSPECTION_IN_PROGRESS"
  | "INSPECTION_COMPLETED"
  | "VERIFIED"
  | "CERTIFICATE_ISSUED"
  | "REJECTED";

export type InspectionResult = "VERIFIED" | "REJECTED";
export type InstrumentType =
  | "WEIGHING_SCALE"
  | "ELECTRONIC_BALANCE"
  | "PETROL_DISPENSER"
  | "FLOW_METER"
  | "LENGTH_MEASURE"
  | "OTHER";

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

export interface StatusHistoryResponse {
  id: number;
  application_id: number;
  from_status: ApplicationStatus | null;
  to_status: ApplicationStatus;
  changed_by_id: number;
  remarks?: string | null;
  created_at: string;
}

export interface ApplicationResponse {
  id: number;
  application_number: string;
  instrument_id: number;
  applicant_id: number;
  application_type: string;
  status: ApplicationStatus;
  submitted_at?: string | null;
  remarks?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationListResponse {
  items: ApplicationResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface ObservationResponse {
  id: number;
  inspection_id: number;
  parameter_name: string;
  observed_value: string;
  standard_value?: string | null;
  unit?: string | null;
  is_passed: boolean;
  remarks?: string | null;
  created_at: string;
}

export interface InspectionResponse {
  id: number;
  application_id: number;
  assigned_to_id?: number | null;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  inspection_location?: string | null;
  scheduling_remarks?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  result?: InspectionResult | null;
  result_remarks?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InspectionDetailResponse extends InspectionResponse {
  observations: ObservationResponse[];
  assigned_to_name?: string | null;
  assigned_to_role?: string | null;
}

export interface ApplicationDetailResponse extends ApplicationResponse {
  status_history: StatusHistoryResponse[];
  inspection?: InspectionResponse | null;
}

export interface ScheduleRequest {
  scheduled_date: string;
  scheduled_time?: string;
  inspection_location?: string;
  scheduling_remarks?: string;
  assigned_to_id?: number;
}

export interface AssignmentRequest {
  assigned_to_id: number;
}

export interface ObservationCreate {
  parameter_name: string;
  observed_value: string;
  standard_value?: string;
  unit?: string;
  is_passed: boolean;
  remarks?: string;
}

export interface InspectionResultUpdate {
  result: InspectionResult;
  remarks?: string;
}

export type CertificateStatus = "ACTIVE" | "EXPIRED";

export interface CertificateResponse {
  id: number;
  certificate_number: string;
  application_id: number;
  instrument_id: number;
  issued_by_id: number;
  issued_at: string;
  valid_from: string;
  valid_until: string;
  status: CertificateStatus;
  integrity_hash: string;
  verification_token: string;
  pdf_path?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CertificateDetailResponse extends CertificateResponse {
  instrument_registration_number?: string | null;
  instrument_type?: string | null;
  manufacturer?: string | null;
  model_name?: string | null;
  serial_number?: string | null;
  capacity?: string | null;
  issued_by_name?: string | null;
  application_number?: string | null;
  verification_url?: string | null;
}

export interface PublicCertificateVerificationResponse {
  certificate_number: string;
  instrument_registration_number: string;
  instrument_type: string;
  manufacturer: string;
  model: string;
  serial_number?: string | null;
  verification_result: string;
  issued_at: string;
  valid_from: string;
  valid_until: string;
  status: CertificateStatus;
  integrity_hash: string;
}

export interface CertificateIssueRequest {
  remarks?: string;
}

export interface CertificateListResponse {
  items: CertificateDetailResponse[];
  total: number;
  page: number;
  page_size: number;
}

export type NotificationType =
  | "APPLICATION_SUBMITTED"
  | "APPLICATION_SCHEDULED"
  | "INSPECTION_ASSIGNED"
  | "INSPECTION_COMPLETED"
  | "APPLICATION_VERIFIED"
  | "APPLICATION_REJECTED"
  | "CERTIFICATE_ISSUED"
  | "CERTIFICATE_EXPIRING"
  | "CERTIFICATE_EXPIRED";

export interface NotificationResponse {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  read_at?: string | null;
  entity_type?: string | null;
  entity_id?: number | null;
}

export interface NotificationListResponse {
  items: NotificationResponse[];
  total: number;
  unread_count: number;
  page: number;
  page_size: number;
}

export interface DashboardSummaryResponse {
  role: UserRole;
  metrics: Record<string, any>;
}

export interface InstrumentResponse {
  id: number;
  registration_number: string;
  owner_id: number;
  instrument_type: InstrumentType;
  manufacturer: string;
  model_name: string;
  serial_number: string;
  capacity?: string | null;
  location: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InstrumentListResponse {
  items: InstrumentResponse[];
  total: number;
  page: number;
  page_size: number;
}
