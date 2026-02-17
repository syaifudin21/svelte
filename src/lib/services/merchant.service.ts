import api from "./api";
import type {
  MerchantSummaryResponse,
  MerchantListResponse,
  MerchantDetailResponse,
  NearbyMerchantResponse,
  NearbyMerchantParams,
} from "../types/merchant";

export const merchantService = {
  async getSummaryStatus(): Promise<MerchantSummaryResponse> {
    const response = await api.get("/api/admin/merchants/summary-status");
    return response.data;
  },

  async getMerchants(params = {}): Promise<MerchantListResponse> {
    const response = await api.get("/api/admin/merchants", { params });
    return response.data;
  },

  async getMerchantDetail(uuid: string): Promise<MerchantDetailResponse> {
    const response = await api.get(`/api/admin/merchants/${uuid}`);
    return response.data;
  },

  async approveMerchant(uuid: string): Promise<any> {
    const response = await api.put(`/api/admin/merchants/${uuid}/approved`, {
      notes: [],
    });
    return response.data;
  },

  async rejectMerchant(uuid: string, notes: string[]): Promise<any> {
    const response = await api.put(`/api/admin/merchants/${uuid}/rejected`, {
      notes: notes,
    });
    return response.data;
  },

  async getNearbyMerchants(
    params: NearbyMerchantParams,
  ): Promise<NearbyMerchantResponse> {
    const response = await api.get("/api/admin/nearby-merchants", { params });
    return response.data;
  },
};
