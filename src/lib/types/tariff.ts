export interface ProvinceInTariff {
  id: string;
  name: string;
}

export interface RegencyInTariff {
  id: string;
  name: string;
  province: ProvinceInTariff;
}

export interface Tariff {
  id: number;
  service_id: number;
  first_km: number;
  first_km_price: number;
  next_km_price: number;
  driver_radius_km: number;
  commission_percent: number;
  max_distance_km: number;
  incentive_fee: number;
  has_incentive: boolean;
  regency: RegencyInTariff | null;
  incentive_expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedTariffData {
  items: Tariff[];
  total_items: number;
  total_pages: number;
  current_page: number;
  items_per_page: number;
}

export interface TariffResponse {
  data: Tariff[] | PaginatedTariffData;
  message: string;
}

export interface TariffFormData {
  service_id: number;
  regency_id: string;
  first_km: number;
  first_km_price: number;
  next_km_price: number;
  driver_radius_km: number;
  commission_percent: number;
  max_distance_km: number;
}

export interface ServiceTariffData {
  service_id: number;
  service_name: string;
  first_km: number;
  first_km_price: number;
  next_km_price: number;
  driver_radius_km: number;
  commission_percent: number;
  max_distance_km: number;
  isExisting?: boolean;
}

export interface IncentiveRequest {
  service_id: number;
  regency_id: string;
  amount: number;
  duration_hours: number;
}

export interface PricingPreview {
  service_id: number;
  regency_id: string;
  distance_km: number;
  base_price: number;
  commission_fee: number;
  incentive_fee: number;
  incentive_expires_at: string | null;
  total_price: number;
  tariff_used: string;
}

export interface PricingPreviewResponse {
  data: PricingPreview;
  message: string;
}
