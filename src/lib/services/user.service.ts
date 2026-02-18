import api from "./api";

export const userService = {
  async getProfile() {
    const response = await api.get("/api/me");
    return response.data;
  },
};
