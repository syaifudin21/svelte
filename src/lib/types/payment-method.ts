export interface PaymentMethod {
  id: number;
  name: string;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethodResponse {
  data: PaymentMethod[];
  message: string;
}
