import api from "./api";

export const accountService = {
  // Update password
  async updatePassword(data: {
    current_password: string;
    new_password: string;
  }): Promise<any> {
    const response = await api.put("/api/me/password", data);
    return response.data;
  },

  // Update profile
  async updateProfile(data: {
    username: string;
    email: string;
    full_name: string;
    phone_number: string;
  }): Promise<any> {
    const response = await api.put("/api/me", data);
    return response.data;
  },

  // Get current user profile
  async getProfile(): Promise<any> {
    const response = await api.get("/api/me");
    return response.data;
  },
};
