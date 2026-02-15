import { merchantService } from "../services/merchant.service";
import type {
  Merchant,
  MerchantStatus,
  MerchantSummary,
} from "../types/merchant";

export function createMerchantStore() {
  let merchants = $state<Merchant[]>([]);
  let summary = $state<MerchantSummary | null>(null);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let status = $state<MerchantStatus>("all" as MerchantStatus);
  let search = $state("");
  let currentPage = $state(1);
  let itemsPerPage = $state(10);
  let totalItems = $state(0);
  let totalPages = $state(0);

  async function fetchSummary() {
    try {
      const response = await merchantService.getSummaryStatus();
      summary = response.data;
    } catch (err: any) {
      console.error("Failed to fetch merchant summary", err);
    }
  }

  async function fetchMerchants(
    filterStatus: MerchantStatus | undefined = status,
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
      // TODO: ensure service accepts these params
      const response = await merchantService.getMerchants({
        status: apiStatus,
        search: apiSearch,
        page,
        limit,
      });
      merchants = response.data.items;
      totalItems = response.data.total_items;
      totalPages = response.data.total_pages;
      currentPage = response.data.current_page;
      itemsPerPage = response.data.items_per_page;
      status = filterStatus || "all";
      search = searchQuery;
    } catch (err: any) {
      error = err.response?.data?.message || "Failed to fetch merchants";
    } finally {
      isLoading = false;
      fetchSummary();
    }
  }

  return {
    get merchants() {
      return merchants;
    },
    get summary() {
      return summary;
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
    fetchSummary,
    fetchMerchants,
    setStatus(newStatus: MerchantStatus) {
      status = newStatus;
      fetchMerchants(newStatus, search, 1);
    },
    setSearch(newSearch: string) {
      search = newSearch;
      fetchMerchants(status, newSearch, 1);
    },
    setPage(newPage: number) {
      currentPage = newPage;
      fetchMerchants(status, search, newPage);
    },
  };
}

export const merchantStore = createMerchantStore();
