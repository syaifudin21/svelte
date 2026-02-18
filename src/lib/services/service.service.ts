import api from "./api";
import type { ServiceResponse, RegencyResponse } from "../types/service";

export const serviceService = {
  async getServices(): Promise<ServiceResponse> {
    const response = await api.get("/api/services");
    return response.data;
  },

  async updateStatus(id: number, isAvailable: boolean): Promise<any> {
    const response = await api.put(`/api/services/${id}/status`, {
      is_available: isAvailable,
    });
    return response.data;
  },
};

export const regencyService = {
  async getRegencies(): Promise<RegencyResponse> {
    const response = await api.get("/api/admin/regencies");
    return response.data;
  },
};
