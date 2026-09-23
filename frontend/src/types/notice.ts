export interface NoticeResponse {
  id: number;
  title: string;
  content: string;
  is_active: boolean;
  published_by_id?: number | null;
  publisher_name?: string | null;
  created_at: string;
  updated_at: string;
}

export interface NoticeListResponse {
  items: NoticeResponse[];
  total: number;
}

export interface NoticeCreateRequest {
  title: string;
  content: string;
}
