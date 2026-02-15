import type {
  DriverListResponse,
  WalletResponse,
  DriverDetailResponse,
  DriverSummaryResponse,
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
    const response = await api.get(`/api/driver/${driverId}`);
    return response.data;
  },

  async getSummaryStatus(): Promise<DriverSummaryResponse> {
    const response = await api.get("/api/admin/driver/summary-status");
    return response.data;
  },

  async approveDriver(driverId: string, notes: string[] = []) {
    const response = await api.put(`/api/admin/driver/${driverId}/approved`, {
      notes,
    });
    return response.data;
  },

  async rejectDriver(driverId: string, notes: string[]) {
    const response = await api.put(`/api/admin/driver/${driverId}/rejected`, {
      notes,
    });
    return response.data;
  },
};
