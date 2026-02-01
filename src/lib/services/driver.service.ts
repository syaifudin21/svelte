import type {
  DriverListResponse,
  WalletResponse,
  DriverDetailResponse,
} from "../types/driver";
import api from "./api";

export const driverService = {
  async getDrivers(params = {}): Promise<DriverListResponse> {
    const response = await api.get("/api/admin/driver", { params });
    return response.data;
  },

  async getDriverWallet(
    driverId: string,
    params = {},
  ): Promise<WalletResponse> {
    const response = await api.get(`/api/admin/driver/${driverId}/wallet`, {
      params,
    });
    return response.data;
  },

  async getDriverDetail(driverId: string): Promise<DriverDetailResponse> {
    const response = await api.get(`/api/admin/driver/${driverId}`);
    return response.data;
  },
};
