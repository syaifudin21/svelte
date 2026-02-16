import type { AdminListResponse, AdminSummaryResponse } from "../types/admin";
import api from "./api";

export const adminService = {
  async getAdmins(params = {}): Promise<AdminListResponse> {
    const response = await api.get("/api/admin/admins", { params });
    return response.data;
  },

  async getSummaryStatus(): Promise<AdminSummaryResponse> {
    const response = await api.get("/api/admin/admins/summary-status");
    return response.data;
  },

  async approveAdmin(adminUuid: string, notes: string[] = []) {
    const response = await api.put(`/api/admin/admins/${adminUuid}/approved`, {
      notes,
    });
    return response.data;
  },

  async rejectAdmin(adminUuid: string, notes: string[]) {
    const response = await api.put(`/api/admin/admins/${adminUuid}/rejected`, {
      notes,
    });
    return response.data;
  },
};
