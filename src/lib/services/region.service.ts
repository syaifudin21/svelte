import api from "./api";
import type {
  ProvinceResponse,
  RegencyOptionResponse,
  DistrictResponse,
  VillageResponse,
} from "../types/region";

export const regionService = {
  async getProvinces(): Promise<ProvinceResponse> {
    const response = await api.get("/api/regions");
    return response.data;
  },

  async getRegenciesByProvince(
    provinceId: string,
  ): Promise<RegencyOptionResponse> {
    const response = await api.get(`/api/regions/${provinceId}`);
    return response.data;
  },

  async getDistricts(
    provinceId: string,
    regencyId: string,
  ): Promise<DistrictResponse> {
    const response = await api.get(`/api/regions/${provinceId}/${regencyId}`);
    return response.data;
  },

  async getVillages(
    provinceId: string,
    regencyId: string,
    districtId: string,
  ): Promise<VillageResponse> {
    const response = await api.get(
      `/api/regions/${provinceId}/${regencyId}/${districtId}`,
    );
    return response.data;
  },
};
