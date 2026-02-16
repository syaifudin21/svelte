import { tariffService } from "../services/tariff.service";
import { serviceService, regencyService } from "../services/service.service";
import { regionService } from "../services/region.service";
import type { Tariff } from "../types/tariff";
import type { Service, Regency } from "../types/service";
import type { Province, RegencyOption } from "../types/region";

export function createTariffStore() {
  let tariffs = $state<Tariff[]>([]);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let serviceId = $state<number | undefined>(undefined);
  let regencyIds = $state<string[]>([]);

  // Pagination state
  let currentPage = $state(1);
  let totalPages = $state(1);
  let totalItems = $state(0);
  let itemsPerPage = $state(10);

  // Additional data for filters
  let services = $state<Service[]>([]);
  let regencies = $state<Regency[]>([]);
  let provinces = $state<Province[]>([]);
  let loadingServices = $state(false);
  let loadingRegencies = $state(false);
  let loadingProvinces = $state(false);

  async function fetchTariffs() {
    isLoading = true;
    error = null;
    try {
      const params: {
        service_id?: number;
        regency_id?: string;
        page?: number;
        limit?: number;
      } = {
        page: currentPage,
        limit: itemsPerPage,
      };
      if (serviceId) params.service_id = serviceId;
      if (regencyIds.length > 0) params.regency_id = regencyIds.join(",");

      console.log("Fetching tariffs with params:", params);

      const response = await tariffService.getTariffs(params);
      const data = response.data;

      if (Array.isArray(data)) {
        tariffs = data;
        totalItems = data.length;
        totalPages = 1;
        currentPage = 1;
        itemsPerPage = data.length;
      } else {
        tariffs = data.items;
        totalItems = data.total_items;
        totalPages = data.total_pages;
        currentPage = data.current_page;
        itemsPerPage = data.items_per_page;
      }
    } catch (err: any) {
      console.error("Failed to fetch tariffs", err);
      error = err.response?.data?.message || "Failed to fetch tariffs";
    } finally {
      isLoading = false;
    }
  }

  async function fetchServices() {
    loadingServices = true;
    try {
      const response = await serviceService.getServices();
      services = response.data;
    } catch (err) {
      console.error("Error fetching services:", err);
    } finally {
      loadingServices = false;
    }
  }

  async function fetchRegencies() {
    loadingRegencies = true;
    try {
      const response = await regencyService.getRegencies();
      regencies = response.data;
    } catch (err) {
      console.error("Error fetching regencies:", err);
    } finally {
      loadingRegencies = false;
    }
  }

  async function fetchProvinces() {
    loadingProvinces = true;
    try {
      const response = await regionService.getProvinces();
      provinces = response.data;
    } catch (err) {
      console.error("Error fetching provinces:", err);
    } finally {
      loadingProvinces = false;
    }
  }

  async function fetchRegenciesByProvince(
    provinceId: string,
  ): Promise<RegencyOption[]> {
    loadingRegencies = true;
    try {
      const response = await regionService.getRegenciesByProvince(provinceId);
      return response.data;
    } catch (err) {
      console.error("Error fetching regencies by province:", err);
      return [];
    } finally {
      loadingRegencies = false;
    }
  }

  function setServiceId(id: number | undefined) {
    serviceId = id;
    currentPage = 1; // Reset to first page
    fetchTariffs();
  }

  function setRegencyIds(ids: string[]) {
    regencyIds = ids;
    currentPage = 1; // Reset to first page
    fetchTariffs();
  }

  function setPage(page: number) {
    currentPage = page;
    fetchTariffs();
  }

  function clearFilters() {
    serviceId = undefined;
    regencyIds = [];
    currentPage = 1; // Reset to first page
    fetchTariffs();
  }

  function getServiceName(id: number): string {
    return services.find((s) => s.id === id)?.name || `Service #${id}`;
  }

  function getRegencyName(id: string): string {
    return regencies.find((r) => r.id === id)?.name || id;
  }

  function getProvinceName(id: string): string {
    return provinces.find((p) => p.id === id)?.name || id;
  }

  return {
    get tariffs() {
      return tariffs;
    },
    get isLoading() {
      return isLoading;
    },
    get error() {
      return error;
    },
    get serviceId() {
      return serviceId;
    },
    get regencyIds() {
      return regencyIds;
    },
    get services() {
      return services;
    },
    get regencies() {
      return regencies;
    },
    get provinces() {
      return provinces;
    },
    get loadingServices() {
      return loadingServices;
    },
    get loadingRegencies() {
      return loadingRegencies;
    },
    get loadingProvinces() {
      return loadingProvinces;
    },
    get currentPage() {
      return currentPage;
    },
    get totalPages() {
      return totalPages;
    },
    get totalItems() {
      return totalItems;
    },
    get itemsPerPage() {
      return itemsPerPage;
    },
    fetchTariffs,
    fetchServices,
    fetchRegencies,
    fetchProvinces,
    fetchRegenciesByProvince,
    setServiceId,
    setRegencyIds,
    setPage,
    clearFilters,
    getServiceName,
    getRegencyName,
    getProvinceName,
  };
}

export const tariffStore = createTariffStore();
