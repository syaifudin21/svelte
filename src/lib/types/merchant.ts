export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
  inStock: boolean;
  isBestSeller?: boolean;
  isVegan?: boolean;
}

export type MerchantStatus = "Online" | "Offline";

export interface Merchant {
  id: string;
  name: string;
  category: string;
  status: MerchantStatus;
  location: string;
  productCount: number;
  icon: any; // Using Lucide icon component type
}
