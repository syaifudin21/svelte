import type { UserDetailResponse, UserListResponse } from "../types/user";
import api from "./api";

export const userService = {
  async getProfile() {
    const response = await api.get("/api/me");
    return response.data;
  },
  async searchUsers(params: {
    search?: string;
    page?: number;
    per_page?: number;
  }): Promise<UserListResponse> {
    const response = await api.get("/api/admin/users", { params });
    return response.data;
  },
  async getUserDetail(id: string): Promise<UserDetailResponse> {
    const response = await api.get(`/api/admin/users/${id}`);
    return response.data;
  },
};
