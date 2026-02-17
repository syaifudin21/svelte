import api from "./api";

export const authService = {
  async register(userData: any) {
    const response = await api.post("/api/auth/register", userData);
    return response.data;
  },

  async login(credentials: any) {
    const response = await api.post("/api/auth/login", credentials);
    return response.data;
  },

  async loginWithGoogle(data: { code?: string; id_token?: string }) {
    const response = await api.post("/api/auth/google", data);
    return response.data;
  },

  async logout() {
    const response = await api.post("/api/logout");
    return response.data;
  },
};
