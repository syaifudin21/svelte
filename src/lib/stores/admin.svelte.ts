import { adminService } from "../services/admin.service";
import type { Admin, AdminStatus, AdminSummary } from "../types/admin";

export function createAdminStore() {
  let admins = $state<Admin[]>([]);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let status = $state<AdminStatus>("all");
  let search = $state("");
  let summary = $state<AdminSummary | null>(null);
  let currentPage = $state(1);
  let itemsPerPage = $state(10);
  let totalItems = $state(0);
  let totalPages = $state(0);

  async function fetchSummary() {
    try {
      const response = await adminService.getSummaryStatus();
      summary = response.data;
    } catch (err) {
      console.error("Failed to fetch admin summary", err);
    }
  }

  async function fetchAdmins(
    filterStatus: AdminStatus = status,
    searchQuery: string = search,
    page: number = currentPage,
    limit: number = itemsPerPage,
  ) {
    isLoading = true;
    error = null;
    try {
      const apiStatus =
        filterStatus === "all" || !filterStatus ? undefined : filterStatus;
      const apiSearch = searchQuery === "" ? undefined : searchQuery;

      const response = await adminService.getAdmins({
        status: apiStatus,
        search: apiSearch,
        page,
        limit,
      });

      admins = response.data.items;
      totalItems = response.data.total_items;
      totalPages = response.data.total_pages;
      currentPage = response.data.current_page;
      itemsPerPage = response.data.items_per_page;
      status = filterStatus;
      search = searchQuery;
    } catch (err: any) {
      error = err.response?.data?.message || "Failed to fetch admins";
    } finally {
      isLoading = false;
      fetchSummary();
    }
  }

  return {
    get admins() {
      return admins;
    },
    get isLoading() {
      return isLoading;
    },
    get error() {
      return error;
    },
    get status() {
      return status;
    },
    get summary() {
      return summary;
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
    fetchAdmins,
    fetchSummary,
    setStatus(newStatus: AdminStatus) {
      status = newStatus;
      fetchAdmins(newStatus, search, 1);
    },
    setSearch(newSearch: string) {
      search = newSearch;
      fetchAdmins(status, newSearch, 1);
    },
    setPage(newPage: number) {
      currentPage = newPage;
      fetchAdmins(status, search, newPage);
    },
    async approveAdmin(uuid: string, notes: string[] = []) {
      isLoading = true;
      error = null;
      try {
        await adminService.approveAdmin(uuid, notes);
        await fetchAdmins(status, search, currentPage);
        return true;
      } catch (err: any) {
        error = err.response?.data?.message || "Failed to approve admin";
        return false;
      } finally {
        isLoading = false;
      }
    },
    async rejectAdmin(uuid: string, notes: string[]) {
      isLoading = true;
      error = null;
      try {
        await adminService.rejectAdmin(uuid, notes);
        await fetchAdmins(status, search, currentPage);
        return true;
      } catch (err: any) {
        error = err.response?.data?.message || "Failed to reject admin";
        return false;
      } finally {
        isLoading = false;
      }
    },
  };
}

export const adminStore = createAdminStore();
