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
};
