export interface Service {
  id: number;
  name: string;
  description: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceResponse {
  data: Service[];
  message: string;
}

export interface Regency {
  id: string;
  name: string;
  province_id: string;
}

export interface RegencyResponse {
  data: Regency[];
  message: string;
}
