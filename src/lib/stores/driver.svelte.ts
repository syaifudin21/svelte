import { driverService } from "../services/driver.service";
import type { Driver, DriverStatus } from "../types/driver";

export function createDriverStore() {
  let drivers = $state<Driver[]>([]);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let status = $state<DriverStatus>("all");
  let search = $state("");

  async function fetchDrivers(
    filterStatus: DriverStatus = status,
    searchQuery: string = search,
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
      });
      drivers = response.data.items;
      status = filterStatus;
      search = searchQuery;
    } catch (err: any) {
      error = err.response?.data?.message || "Failed to fetch drivers";
    } finally {
      isLoading = false;
    }
  }

  return {
    get drivers() {
      return drivers;
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
    fetchDrivers,
    setStatus(newStatus: DriverStatus) {
      status = newStatus;
      fetchDrivers(newStatus, search);
    },
    setSearch(newSearch: string) {
      search = newSearch;
      fetchDrivers(status, newSearch);
    },
  };
}

export const driverStore = createDriverStore();
