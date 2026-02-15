import api from "./api";
import type {
  MerchantSummaryResponse,
  MerchantListResponse,
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
};
