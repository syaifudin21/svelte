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

export type DriverStatus =
  | "submitted"
  | "approved"
  | "rejected"
  | "pending"
  | "all"
  | "";

export interface DriverSummary {
  approve: number;
  submitted: number;
  rejected: number;
  pending: number;
  total: number;
}

export interface DriverSummaryResponse {
  data: DriverSummary;
  message: string;
}

export interface Driver {
  uuid: string;
  username: string;
  email: string | null;
  full_name: string;
  phone_number: string;
  plate_number: string;
  status: DriverStatus;
  reject_notes: any[];
  avg_rating: number | null;
}

export type DriverListResponse = PaginatedResponse<Driver>;

export interface WalletItem {
  id: number;
  wallet_id: number;
  transaction_type: "debit" | "credit" | "topup";
  amount: number;
  balance_before: number;
  balance_after: number;
  reference_id: string | null;
  description: string;
  created_at: string;
}

export interface WalletResponse {
  data: {
    last_balance: number;
    items: WalletItem[];
    total_items: number;
    total_pages: number;
    current_page: number;
    items_per_page: number;
  };
  message: string;
}

export interface DriverDetailData {
  user: {
    uuid: string;
    username: string;
    email: string | null;
    roles: string[];
  };
  driver: {
    uuid: string;
    full_name: string;
    phone_number: string;
    address: string;
    domicile_url: string | null;
    ktp_number: string;
    ktp_url: string | null;
    selfie_with_ktp_url: string | null;
    date_of_birth: string;
    gender: string;
    work_area_id: string;
    plate_number: string;
    vehicle_brand: string;
    vehicle_model: string;
    vehicle_year: number;
    vehicle_photo_url: string | null;
    stnk_url: string | null;
    license_number: string | null;
    service_id: number;
    image_url: string | null;
    joined_at: string;
    vehicle: string | null;
    color: string;
    skck_url: string | null;
    sim_number: string | null;
    sim_url: string | null;
    sim_expired_at: string | null;
    bank_name: string | null;
    account_number: string | null;
    account_holder_name: string | null;
    referral_code: string | null;
    status: DriverStatus;
    reject_notes: any[];
  };
  work_area: {
    id: string;
    name: string;
  };
  summary: {
    total_orders: number;
    total_revenue: number;
    total_distance: number;
  };
  rating: {
    average: number;
    total: number;
  };
  service: {
    id: number;
    name: string;
  };
}

export interface DriverDetailResponse {
  data: DriverDetailData;
  message: string;
}
