import api from "./api";
import type {
  MerchantSummaryResponse,
  MerchantListResponse,
  MerchantDetailResponse,
  NearbyMerchantResponse,
  NearbyMerchantParams,
  RegisterRequest,
  RegisterResponse,
  ProfileRequest,
  ProfileResponse,
  DocumentsRequest,
  DocumentsResponse,
  BankAccountRequest,
  BankAccountResponse,
  MenuItemRequest,
  MenuItemResponse,
  SubmitOnboardingRequest,
  SubmitOnboardingResponse,
} from "../types/merchant";

export const merchantService = {
  async getSummaryStatus(): Promise<MerchantSummaryResponse> {
    const response = await api.get("/api/admin/merchants/summary-status");
    return response.data;
  },

  async getMerchants(params = {}): Promise<MerchantListResponse> {
    const response = await api.get("/api/admin/merchants", { params });
    return response.data;
  },

  async getMerchantDetail(uuid: string): Promise<MerchantDetailResponse> {
    const response = await api.get(`/api/admin/merchants/${uuid}`);
    return response.data;
  },

  async approveMerchant(uuid: string): Promise<any> {
    const response = await api.put(`/api/admin/merchants/${uuid}/approved`, {
      notes: [],
    });
    return response.data;
  },

  async rejectMerchant(uuid: string, notes: string[]): Promise<any> {
    const response = await api.put(`/api/admin/merchants/${uuid}/rejected`, {
      notes: notes,
    });
    return response.data;
  },

  async getNearbyMerchants(
    params: NearbyMerchantParams,
  ): Promise<NearbyMerchantResponse> {
    const response = await api.get("/api/admin/nearby-merchants", { params });
    return response.data;
  },

  // Merchant Registration - Step 1
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post("/api/v1/merchant/register", data);
    return response.data;
  },

  // Get merchant profile when user has unapproved registration (400 error handler)
  async getWaitingMerchantProfile(): Promise<ProfileResponse> {
    const response = await api.get("/api/v1/merchant/me/waiting");
    return response.data;
  },

  // Merchant Registration - Step 2
  async updateProfile(data: ProfileRequest): Promise<ProfileResponse> {
    const response = await api.post("/api/v1/merchant/profile", data);
    return response.data;
  },

  // Merchant Registration - Step 3
  async updateDocuments(data: DocumentsRequest): Promise<DocumentsResponse> {
    const response = await api.post("/api/v1/merchant/documents", data);
    return response.data;
  },

  // Merchant Registration - Step 4
  async updateBankAccount(
    data: BankAccountRequest,
  ): Promise<BankAccountResponse> {
    const response = await api.post("/api/v1/merchant/bank-account", data);
    return response.data;
  },

  // Merchant Registration - Step 5
  async addMenuItem(data: MenuItemRequest): Promise<MenuItemResponse> {
    const response = await api.post("/api/v1/merchant/menu/items", data);
    return response.data;
  },

  // Merchant Registration - Step 6
  async submitOnboarding(
    data: SubmitOnboardingRequest,
  ): Promise<SubmitOnboardingResponse> {
    const response = await api.post("/api/v1/merchant/onboarding/submit", data);
    return response.data;
  },

  // Get merchant profile by UUID (for recovering uncompleted registration)
  async getMerchantProfile(uuid: string): Promise<ProfileResponse> {
    const response = await api.get(`/api/v1/merchant/me/${uuid}`);
    return response.data;
  },

  // Get current user's merchant profile (alternative endpoint)
  async getCurrentMerchantProfile(): Promise<ProfileResponse> {
    const response = await api.get("/api/v1/merchant/me");
    return response.data;
  },
};
