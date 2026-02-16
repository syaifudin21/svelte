import type {
  WalletRequestListResponse,
  WalletRequestSummaryResponse,
} from "../types/wallet";
import api from "./api";

export const walletService = {
  async getTopupRequests(params = {}): Promise<WalletRequestListResponse> {
    const response = await api.get("/api/admin/wallet/request-topup", {
      params,
    });
    return response.data;
  },

  async getSummaryStatus(): Promise<WalletRequestSummaryResponse> {
    const response = await api.get(
      "/api/admin/wallet/request-topup/summary-status",
    );
    return response.data;
  },

  async updateRequestStatus(
    requestId: number,
    status: "approved" | "rejected",
    adminNote: string = "",
  ) {
    const response = await api.put(
      `/api/admin/wallet/request-topup/${requestId}`,
      {
        status,
        admin_note: adminNote,
      },
    );
    return response.data;
  },
};
