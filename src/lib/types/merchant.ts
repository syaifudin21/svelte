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
  | "step3"
  | "step4"
  | "step5"
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

export interface UserInMerchant {
  uuid: string;
  username: string;
  email: string | null;
  roles: string[];
}

export interface RatingInMerchant {
  average: number;
  total: number;
}

export interface CategoryInMerchant {
  id: number;
  name: string;
}

export interface ProductInMerchant {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  merchant_id: string;
}

export interface OperationDay {
  open: string;
  close: string;
}

export interface OperationHours {
  monday: OperationDay;
  tuesday: OperationDay;
  wednesday: OperationDay;
  thursday: OperationDay;
  friday: OperationDay;
  saturday: OperationDay;
  sunday: OperationDay;
}

export interface MerchantProfile {
  uuid: string;
  store_name: string;
  category_id: number;
  address: string;
  latitude: number;
  longitude: number;
  contact_phone: string;
  operation_hours: OperationHours;
  id_card_number: string;
  id_card_image_url: string;
  selfie_image_url: string;
  store_front_image_url: string;
  store_inside_image_url: string;
  bank_code: string;
  account_number: string;
  account_holder_name: string;
  status: MerchantStatus;
  reject_notes: string[] | null;
  created_at: string;
  work_area_id: string;
  work_area_name: string;
  avg_rating: number | null;
  total_ratings: number;
}

export interface MerchantDetail {
  user: UserInMerchant;
  rating: RatingInMerchant;
  category: CategoryInMerchant;
  merchant: MerchantProfile;
  products: ProductInMerchant[];
}

export interface NearbyMerchant {
  uuid: string;
  store_name: string;
  latitude: number;
  longitude: number;
  category_id: number;
  category_name: string;
  status: string;
  avg_rating: number | null;
}

export interface NearbyMerchantParams {
  status?: string;
  category_id?: number;
  lat: number;
  long: number;
  radius: number;
}

export interface NearbyMerchantResponse {
  data: NearbyMerchant[];
  message: string;
}

export interface MerchantDetailResponse {
  data: MerchantDetail;
  message: string;
}

// Registration Step 1 - Register
export interface RegisterRequest {
  full_name: string;
  email: string;
  phone_number: string;
  work_area_id: string;
}

export interface RegisterResponse {
  data?: {
    merchant_uuid?: string;
  };
  merchant_uuid?: string;
  message: string;
}

// Registration Step 2 - Profile
export interface OperationHourItem {
  day: string;
  open: string;
  close: string;
}

export interface ProfileRequest {
  merchant_uuid: string;
  merchant_name: string;
  category_id: number;
  address: string;
  coordinate: {
    latitude: number;  // Must be number, not null
    longitude: number; // Must be number, not null
  };
  contact_phone: string;
  operation_hours: OperationHourItem[];
}

export interface ProfileResponse {
  data: MerchantProfile | {
    items: MerchantProfile[];
    total_items: number;
    total_pages: number;
    current_page: number;
    items_per_page: number;
  };
  message: string;
}

// Registration Step 3 - Documents
export interface DocumentsRequest {
  merchant_uuid: string;
  id_card_number: string;
  id_card_image: string;
  selfie_image: string;
  store_front_image: string;
  store_inside_image: string;
}

export interface DocumentsResponse {
  data: MerchantProfile;
  message: string;
}

// Registration Step 4 - Bank Account
export interface BankAccountRequest {
  merchant_uuid: string;
  bank_code: string;
  account_number: string;
  account_holder_name: string;
}

export interface BankAccountResponse {
  data: MerchantProfile;
  message: string;
}

// Registration Step 5 - Menu Items
export interface MenuItemRequest {
  merchant_uuid: string;
  name: string;
  description: string;
  price: number;
  category: string;
  is_available: boolean;
  image_url: string;
}

export interface MenuItemResponse {
  message: string;
}

// Registration Step 6 - Submit Onboarding
export interface SubmitOnboardingRequest {
  merchant_uuid: string;
  declaration_agreement: boolean;
  submit_date: string;
}

export interface SubmitOnboardingResponse {
  data: MerchantProfile;
  message: string;
}
