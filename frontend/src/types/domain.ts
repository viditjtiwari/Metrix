export type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "PAYMENT_UPLOADED"
  | "PAYMENT_VERIFIED"
  | "UNDER_REVIEW"
  | "CLARIFICATION_ASKED"
  | "SCHEDULED"
  | "INSPECTION_IN_PROGRESS"
  | "INSPECTION_COMPLETED"
  | "VERIFIED"
  | "CERTIFICATE_ISSUED"
  | "REJECTED";

export type PaymentStatus = "PENDING" | "UPLOADED" | "VERIFIED" | "REJECTED";

export type InspectionResult = "VERIFIED" | "REJECTED";

import { InstrumentType } from "./instruments";
export * from "./instruments";

export type CertificateStatus = "ACTIVE" | "EXPIRED" | "SUPERSEDED" | "REVOKED";

export type NotificationType =
  | "APPLICATION_SUBMITTED"
  | "APPLICATION_SCHEDULED"
  | "INSPECTION_ASSIGNED"
  | "INSPECTION_COMPLETED"
  | "APPLICATION_VERIFIED"
  | "APPLICATION_REJECTED"
  | "CERTIFICATE_ISSUED"
  | "CERTIFICATE_EXPIRING"
  | "CERTIFICATE_EXPIRED"
  | "PAYMENT_VERIFIED"
  | "PAYMENT_REJECTED"
  | "CLARIFICATION_ASKED";

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

  // Statutory fee & payment tracking
  payment_status?: PaymentStatus;
  payment_receipt_url?: string | null;
  challan_reference_number?: string | null;
  challan_date?: string | null;
  calculated_fee?: number;
  late_fee?: number;
  total_fee?: number;
  payment_uploaded_at?: string | null;
  payment_verified_at?: string | null;
  payment_remarks?: string | null;

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
  image_urls?: string | string[] | null;
  certificate_image_url?: string | null;
  inspection_mode?: string | null;
  seal_number?: string | null;
  stamp_quarter?: string | null;
  physical_inspection_data?: string | null;
  metrological_test_data?: string | null;
  gatc_test_report_url?: string | null;
  gatc_recommendation?: string | null;
  lmo_approval_status?: string | null;
  lmo_approval_remarks?: string | null;
  assigned_to_name?: string | null;
  assigned_to_role?: string | null;
  application_number?: string | null;
  created_at: string;
  updated_at: string;
}

export interface InspectionDetailResponse extends InspectionResponse {
  observations: ObservationResponse[];
}

export interface InspectionListResponse {
  items: InspectionResponse[];
  total: number;
  page: number;
  page_size: number;
}

export interface ApplicationDetailResponse extends ApplicationResponse {
  status_history: StatusHistoryResponse[];
  inspection?: InspectionResponse | null;
  applicant_name?: string | null;
  applicant_email?: string | null;
  applicant_business_name?: string | null;
  applicant_phone?: string | null;
  instrument_registration_number?: string | null;
  instrument_type?: string | null;
  instrument_manufacturer?: string | null;
  instrument_model?: string | null;
  instrument_serial_number?: string | null;
  instrument_capacity?: string | null;
  instrument_location?: string | null;
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
  inspecting_officer_name?: string | null;
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

export interface InstrumentResponse {
  id: number;
  registration_number: string;
  owner_id: number;
  instrument_type: InstrumentType;
  manufacturer: string;
  model_name: string;
  serial_number: string;
  capacity?: string | null;
  min_capacity?: string | null;
  max_capacity?: string | null;
  capacity_unit?: string | null;
  location: string;
  image_urls?: string | string[] | null;
  tac_certificate_url?: string | null;
  purchase_invoice_url?: string | null;
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

export interface BatchUploadErrorItem {
  row: number;
  serial_number?: string | null;
  error: string;
}

export interface BatchInstrumentUploadResponse {
  total_rows: number;
  successful_count: number;
  failed_count: number;
  created_instruments: InstrumentResponse[];
  errors: BatchUploadErrorItem[];
}
