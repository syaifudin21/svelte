export interface Province {
  id: string;
  name: string;
}

export interface ProvinceResponse {
  data: Province[];
  message: string;
}

export interface RegencyOption {
  id: string;
  province_id: string;
  name: string;
}

export interface RegencyOptionResponse {
  data: RegencyOption[];
  message: string;
}

export interface District {
  id: string;
  regency_id: string;
  name: string;
}

export interface DistrictResponse {
  data: District[];
  message: string;
}

export interface Village {
  id: string;
  district_id: string;
  name: string;
}

export interface VillageResponse {
  data: Village[];
  message: string;
}
