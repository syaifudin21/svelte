import { walletService } from "../services/wallet.service";
import type {
  WalletRequest,
  WalletRequestStatus,
  WalletRequestSummary,
} from "../types/wallet";

export function createWalletStore() {
  let requests = $state<WalletRequest[]>([]);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let status = $state<WalletRequestStatus>("all");
  let search = $state("");
  let summary = $state<WalletRequestSummary | null>(null);
  let currentPage = $state(1);
  let itemsPerPage = $state(10);
  let totalItems = $state(0);
  let totalPages = $state(0);

  async function fetchSummary() {
    try {
      const response = await walletService.getSummaryStatus();
      summary = response.data;
    } catch (err) {
      console.error("Failed to fetch wallet summary", err);
    }
  }

  async function fetchRequests(
    filterStatus: WalletRequestStatus = status,
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

      const response = await walletService.getTopupRequests({
        status: apiStatus,
        search: apiSearch,
        page,
        limit,
      });

      requests = response.data.items;
      totalItems = response.data.total_items;
      totalPages = response.data.total_pages;
      currentPage = response.data.current_page;
      itemsPerPage = response.data.items_per_page;
      status = filterStatus;
      search = searchQuery;
    } catch (err: any) {
      error = err.response?.data?.message || "Failed to fetch topup requests";
    } finally {
      isLoading = false;
      fetchSummary();
    }
  }

  return {
    get requests() {
      return requests;
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
    fetchRequests,
    fetchSummary,
    setStatus(newStatus: WalletRequestStatus) {
      status = newStatus;
      fetchRequests(newStatus, search, 1);
    },
    setSearch(newSearch: string) {
      search = newSearch;
      fetchRequests(status, newSearch, 1);
    },
    setPage(newPage: number) {
      currentPage = newPage;
      fetchRequests(status, search, newPage);
    },
    async updateRequestStatus(
      requestId: number,
      newStatus: "approved" | "rejected",
      adminNote: string = "",
    ) {
      isLoading = true;
      error = null;
      try {
        await walletService.updateRequestStatus(
          requestId,
          newStatus,
          adminNote,
        );
        await fetchRequests(status, search, currentPage);
        return true;
      } catch (err: any) {
        error =
          err.response?.data?.message || "Failed to update request status";
        return false;
      } finally {
        isLoading = false;
      }
    },
  };
}

export const walletStore = createWalletStore();
