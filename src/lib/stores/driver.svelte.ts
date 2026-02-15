import { driverService } from "../services/driver.service";
import type {
  Driver,
  DriverStatus,
  DriverSummary,
  DriverDetailData,
} from "../types/driver";

export function createDriverStore() {
  let drivers = $state<Driver[]>([]);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let status = $state<DriverStatus>("all");
  let search = $state("");
  let summary = $state<DriverSummary | null>(null);
  let currentPage = $state(1);
  let itemsPerPage = $state(10);
  let totalItems = $state(0);
  let totalPages = $state(0);

  let driverDetail = $state<DriverDetailData | null>(null);

  async function fetchSummary() {
    try {
      const response = await driverService.getSummaryStatus();
      summary = response.data;
    } catch (err) {
      console.error("Failed to fetch driver summary", err);
    }
  }

  async function fetchDriverDetail(uuid: string) {
    isLoading = true;
    error = null;
    try {
      const response = await driverService.getDriverDetail(uuid);
      driverDetail = response.data;
    } catch (err: any) {
      error = err.response?.data?.message || "Failed to fetch driver details";
    } finally {
      isLoading = false;
    }
  }

  async function fetchDrivers(
    filterStatus: DriverStatus = status,
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
      const response = await driverService.getDrivers({
        status: apiStatus,
        search: apiSearch,
        page,
        limit,
      });
      drivers = response.data.items;
      totalItems = response.data.total_items;
      totalPages = response.data.total_pages;
      currentPage = response.data.current_page;
      itemsPerPage = response.data.items_per_page;
      status = filterStatus;
      search = searchQuery;
    } catch (err: any) {
      error = err.response?.data?.message || "Failed to fetch drivers";
    } finally {
      isLoading = false;
      fetchSummary();
    }
  }

  return {
    get drivers() {
      return drivers;
    },
    get driverDetail() {
      return driverDetail;
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
    fetchDrivers,
    fetchSummary,
    fetchDriverDetail,
    setStatus(newStatus: DriverStatus) {
      status = newStatus;
      fetchDrivers(newStatus, search, 1);
    },
    setSearch(newSearch: string) {
      search = newSearch;
      fetchDrivers(status, newSearch, 1);
    },
    setPage(newPage: number) {
      currentPage = newPage;
      fetchDrivers(status, search, newPage);
    },
    async approveDriver(uuid: string, notes: string[] = []) {
      isLoading = true;
      error = null;
      try {
        await driverService.approveDriver(uuid, notes);
        await fetchDriverDetail(uuid);
        return true;
      } catch (err: any) {
        error = err.response?.data?.message || "Failed to approve driver";
        return false;
      } finally {
        isLoading = false;
      }
    },
    async rejectDriver(uuid: string, notes: string[]) {
      isLoading = true;
      error = null;
      try {
        await driverService.rejectDriver(uuid, notes);
        await fetchDriverDetail(uuid);
        return true;
      } catch (err: any) {
        error = err.response?.data?.message || "Failed to reject driver";
        return false;
      } finally {
        isLoading = false;
      }
    },
  };
}

export const driverStore = createDriverStore();
