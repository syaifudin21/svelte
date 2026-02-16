export type AdminStatus =
  | "submitted"
  | "approved"
  | "rejected"
  | "pending"
  | "all"
  | "";

export interface Admin {
  id: number;
  user_id: number;
  uuid: string;
  username: string;
  email: string | null;
  status: AdminStatus;
  work_area_ids: string[];
  name: string;
  reject_notes: string[] | null;
}

export interface PaginatedResponse<T> {
  data: {
    items: T[];
    total_items: number;
    total_pages: number;
    current_page: number;
    items_per_page: number;
  };
  message: string;
}

export type AdminListResponse = PaginatedResponse<Admin>;

export interface AdminSummary {
  approve: number;
  submitted: number;
  rejected: number;
  pending: number;
  total: number;
}

export interface AdminSummaryResponse {
  data: AdminSummary;
  message: string;
}
