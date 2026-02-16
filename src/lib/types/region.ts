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
