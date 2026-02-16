import api from "./api";
import type { ServiceResponse, RegencyResponse } from "../types/service";

export const serviceService = {
  async getServices(): Promise<ServiceResponse> {
    const response = await api.get("/api/services");
    return response.data;
  },
};

export const regencyService = {
  async getRegencies(): Promise<RegencyResponse> {
    const response = await api.get("/api/admin/regencies");
    return response.data;
  },
};
