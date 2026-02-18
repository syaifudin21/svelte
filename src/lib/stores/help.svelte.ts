import { helpService } from "$lib/services/help.service";
import type { HelpCategory, FAQ } from "$lib/types/help";

class HelpStore {
  categories = $state<HelpCategory[]>([]);
  faqs = $state<FAQ[]>([]);
  selectedCategory = $state<number | null>(null);
  searchQuery = $state("");
  isLoading = $state(false);
  isSearching = $state(false);

  constructor() {
    this.init();
  }

  async init() {
    this.isLoading = true;
    await this.fetchCategories();
    this.isLoading = false;
  }

  async fetchCategories() {
    try {
      const res = await helpService.getCategories();
      this.categories = res.data;
      if (this.selectedCategory === null && this.categories.length > 0) {
        this.selectCategory(this.categories[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch help categories:", error);
    }
  }

  async selectCategory(id: number) {
    this.selectedCategory = id;
    this.searchQuery = ""; // Clear search when selecting category
    await this.fetchFAQsForSelectedCategory();
  }

  // Helper to re-fetch FAQs for the current selected category
  async fetchFAQsForSelectedCategory() {
    if (this.selectedCategory !== null) {
      this.isLoading = true;
      try {
        const res = await helpService.getFAQs(this.selectedCategory);
        this.faqs = res.data;
      } catch (error) {
        console.error("Failed to fetch FAQs:", error);
      } finally {
        this.isLoading = false;
      }
    } else {
      this.faqs = []; // Clear FAQs if no category is selected
    }
  }

  async searchHelp(query: string) {
    this.isSearching = true;
    this.searchQuery = query;
    try {
      const res = await helpService.searchHelp(query);
      this.faqs = res.data;
      this.selectedCategory = null; // Clear category selection on search
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      this.isSearching = false;
    }
  }

  // Admin functions for categories
  async createCategory(data: any) {
    await helpService.createCategory(data);
    await this.fetchCategories();
  }

  async updateCategory(id: number, data: any) {
    await helpService.updateCategory(id, data);
    await this.fetchCategories();
  }

  async deleteCategory(id: number) {
    await helpService.deleteCategory(id);
    if (this.selectedCategory === id) this.selectedCategory = null;
    await this.fetchCategories();
  }

  // Admin functions for FAQs
  async createFAQ(data: any) {
    await helpService.createFAQ(data);
    await this.fetchFAQsForSelectedCategory(); // Refresh FAQs after creation
  }

  async updateFAQ(id: number, data: any) {
    await helpService.updateFAQ(id, data);
    await this.fetchFAQsForSelectedCategory(); // Refresh FAQs after update
  }

  async deleteFAQ(id: number) {
    await helpService.deleteFAQ(id);
    await this.fetchFAQsForSelectedCategory(); // Refresh FAQs after deletion
  }
}

export const helpStore = new HelpStore();
