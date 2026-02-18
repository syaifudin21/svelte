import api from "./api";
import type { PaymentMethodResponse } from "../types/payment-method";

export const paymentMethodService = {
  async getPaymentMethods(): Promise<PaymentMethodResponse> {
    const response = await api.get("/api/payment-methods");
    return response.data;
  },

  async updateStatus(id: number, isAvailable: boolean): Promise<any> {
    const response = await api.put(`/api/payment-methods/${id}/status`, {
      is_available: isAvailable,
    });
    return response.data;
  },
};
