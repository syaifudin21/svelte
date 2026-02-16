import api from "./api";
import type { TariffResponse, TariffFormData } from "../types/tariff";

export const tariffService = {
  async getTariffs(params?: {
    service_id?: number;
    regency_id?: string;
    page?: number;
    limit?: number;
  }): Promise<TariffResponse> {
    const response = await api.get("/api/admin/tariffs", { params });
    return response.data;
  },

  async getDefaultTariffs(): Promise<TariffResponse> {
    const response = await api.get("/api/admin/tariffs-default");
    return response.data;
  },

  async getPrioritizedTariffs(regencyId: string): Promise<TariffResponse> {
    const response = await api.get("/api/admin/tariffs-prioritized", {
      params: { regency_id: regencyId },
    });
    return response.data;
  },

  async saveTariff(data: TariffFormData): Promise<any> {
    const response = await api.post("/api/admin/tariffs", data);
    return response.data;
  },
};
