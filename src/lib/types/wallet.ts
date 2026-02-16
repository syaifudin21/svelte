import type { PaginatedResponse } from "./admin";

export type WalletRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "all"
  | "";

export interface WalletRequest {
  id: number;
  user_id: number;
  wallet_id: number;
  amount: number;
  status: WalletRequestStatus;
  description: string;
  admin_note: string | null;
  requested_at: string;
  processed_at: string | null;
  processed_by: number | null;
}

export type WalletRequestListResponse = PaginatedResponse<WalletRequest>;

export interface WalletRequestSummary {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

export interface WalletRequestSummaryResponse {
  data: WalletRequestSummary;
  message: string;
}
