import api from "./api";

export const deviceService = {
  async getDevices() {
    const response = await api.get("/api/devices");
    return response.data;
  },

  async revokeDevice(jti: string) {
    const response = await api.delete(`/api/devices/${jti}/revoke`);
    return response.data;
  },
};
