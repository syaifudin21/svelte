import api from "./api";
import type {
  TariffResponse,
  TariffFormData,
  IncentiveRequest,
  PricingPreviewResponse,
} from "../types/tariff";

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

  async updateIncentive(data: IncentiveRequest): Promise<any> {
    const response = await api.put("/api/admin/tariffs/incentive", data);
    return response.data;
  },

  async getPricingPreview(params: {
    regency_id: string;
    distance_km: number;
    service_id: number;
  }): Promise<PricingPreviewResponse> {
    const response = await api.get("/api/pricing/preview", { params });
    return response.data;
  },
};
