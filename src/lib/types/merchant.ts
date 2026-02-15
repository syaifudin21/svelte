export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  inStock: boolean;
  isBestSeller?: boolean;
  isVegan?: boolean;
}

export type MerchantStatus =
  | "online"
  | "offline"
  | "approved"
  | "rejected"
  | "submitted"
  | "pending"
  | "step1"
  | "step2"
  | "all";

export interface Merchant {
  uuid: string;
  username: string;
  email: string | null;
  store_name: string;
  category_id: number | null;
  category_name: string | null;
  latitude: number | null;
  longitude: number | null;
  status: MerchantStatus;
  reject_notes: string[] | null;
  avg_rating: number | null;
}

export interface MerchantSummary {
  approve: number;
  submitted: number;
  rejected: number;
  pending: number;
  total: number;
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

export type MerchantListResponse = PaginatedResponse<Merchant>;

export interface MerchantSummaryResponse {
  data: MerchantSummary;
  message?: string;
}
