import api from "./api";
import type { ProvinceResponse, RegencyOptionResponse } from "../types/region";

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
};
