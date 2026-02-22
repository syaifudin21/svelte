import api from "./api";

export interface NotificationResponse {
  data: {
    sent: number;
    total: number;
  };
  message: string;
}

export const notificationService = {
  async sendToUser(
    userId: number,
    title: string,
    body: string,
    data: any = {},
  ): Promise<NotificationResponse> {
    const response = await api.post("/api/notifications/send-to-user", {
      user_id: userId,
      title,
      body,
      data,
    });
    return response.data;
  },

  async sendBulk(
    userIds: number[],
    title: string,
    body: string,
    data: any = {},
  ): Promise<NotificationResponse> {
    const response = await api.post("/api/notifications/send-bulk", {
      user_ids: userIds,
      title,
      body,
      data,
    });
    return response.data;
  },

  async testNotification(): Promise<NotificationResponse> {
    const response = await api.post("/api/notifications/test");
    return response.data;
  },
};
