import api from "./api";
import type { HelpCategoryResponse, FAQResponse } from "../types/help";

export const helpService = {
  async getCategories(): Promise<HelpCategoryResponse> {
    const response = await api.get("/api/help/categories");
    return response.data;
  },

  async getFAQs(categoryId: number): Promise<FAQResponse> {
    const response = await api.get(`/api/help/faqs`, {
      params: { category_id: categoryId },
    });
    return response.data;
  },

  async searchHelp(query: string): Promise<FAQResponse> {
    const response = await api.get("/api/help/search", {
      params: { q: query },
    });
    return response.data;
  },

  // Admin Categories
  async createCategory(data: any): Promise<any> {
    const response = await api.post("/api/help/admin/categories", data);
    return response.data;
  },

  async updateCategory(id: number, data: any): Promise<any> {
    const response = await api.put(`/api/help/admin/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: number): Promise<any> {
    const response = await api.delete(`/api/help/admin/categories/${id}`);
    return response.data;
  },
};
