import { userService } from "$lib/services/user.service";
import type { User, UserDetail } from "$lib/types/user";

export function createUserStore() {
  let users = $state<User[]>([]);
  let userDetail = $state<UserDetail | null>(null);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let search = $state("");
  let currentPage = $state(1);
  let itemsPerPage = $state(10);
  let totalItems = $state(0);
  let totalPages = $state(0);

  return {
    get users() {
      return users;
    },
    get userDetail() {
      return userDetail;
    },
    get isLoading() {
      return isLoading;
    },
    get error() {
      return error;
    },
    get search() {
      return search;
    },
    get currentPage() {
      return currentPage;
    },
    get itemsPerPage() {
      return itemsPerPage;
    },
    get totalItems() {
      return totalItems;
    },
    get totalPages() {
      return totalPages;
    },

    setSearch(value: string) {
      search = value;
      currentPage = 1;
      this.fetchUsers(value, 1);
    },

    setPage(page: number) {
      currentPage = page;
      this.fetchUsers(search, page);
    },

    async fetchUsers(searchTerm?: string, page?: number) {
      isLoading = true;
      error = null;
      try {
        const response = await userService.searchUsers({
          search: searchTerm || search,
          page: page || currentPage,
          per_page: itemsPerPage,
        });
        users = response.data.items || [];
        totalItems = response.data.total_items;
        totalPages = response.data.total_pages;
        currentPage = response.data.current_page;
      } catch (err: any) {
        console.error("Failed to fetch users:", err);
        error = err.response?.data?.message || "Failed to fetch users";
        users = [];
      } finally {
        isLoading = false;
      }
    },

    async fetchUserDetail(id: string) {
      isLoading = true;
      error = null;
      try {
        const response = await userService.getUserDetail(id);
        userDetail = response.data;
      } catch (err: any) {
        console.error("Failed to fetch user detail:", err);
        error = err.response?.data?.message || "Failed to fetch user detail";
        userDetail = null;
      } finally {
        isLoading = false;
      }
    },

    resetUserDetail() {
      userDetail = null;
    },
  };
}

export const userStore = createUserStore();
