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

  async updateFcmToken(fcm_token: string) {
    const response = await api.put("/api/devices/fcm-token", { fcm_token });
    return response.data;
  },

  async getMyDevices() {
    const response = await api.get("/api/devices/my");
    return response.data;
  },
};
