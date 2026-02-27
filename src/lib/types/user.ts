export interface User {
  id: number;
  uuid: string;
  username: string;
  email: string;
  roles: string[];
}

export interface UserCustomer {
  id: number;
  loyalty_points: number;
  total_ratings: number;
  created_at: string;
}

export interface UserDriver {
  id: number;
  [key: string]: any;
}

export interface UserMerchant {
  id: number;
  [key: string]: any;
}

export interface UserAdmin {
  id: number;
  name: string;
  work_area: Array<{ id: string; name: string }>;
  status: "pending" | "approved" | "rejected";
  admin_type: string;
  created_at: string;
}

export interface UserOperator {
  id: number;
  [key: string]: any;
}

export interface UserDetail {
  id: number;
  uuid: string;
  username: string;
  email: string;
  roles: string[];
  customer: UserCustomer | null;
  driver: UserDriver | null;
  merchant: UserMerchant | null;
  admin: UserAdmin | null;
  operator: UserOperator | null;
}

export interface UserListResponse {
  data: {
    items: User[];
    total_items: number;
    total_pages: number;
    current_page: number;
    items_per_page: number;
  };
  message: string;
}

export interface UserDetailResponse {
  data: UserDetail;
  message: string;
}
