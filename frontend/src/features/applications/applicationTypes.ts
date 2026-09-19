export interface ApplicationCreateRequest {
  instrument_id: number;
  application_type?: string;
  remarks?: string;
  submit_now?: boolean;
}
