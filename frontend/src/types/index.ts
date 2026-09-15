export interface HealthStatus {
  status: "ok" | "degraded";
  environment: string;
  version: string;
  database: "connected" | "disconnected";
  details?: string | null;
}

export type UserRole = "OWNER" | "LMO" | "GATC" | "ADMIN" | "PUBLIC";

export type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "SCHEDULED"
  | "INSPECTION_IN_PROGRESS"
  | "INSPECTION_COMPLETED"
  | "VERIFIED"
  | "CERTIFICATE_ISSUED"
  | "REJECTED"
  | "EXPIRED"
  | "RE_VERIFICATION_REQUESTED";
