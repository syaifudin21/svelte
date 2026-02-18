import { deviceService } from "$lib/services/device.service";
import { toast } from "svelte-sonner";

export function createDeviceStore() {
  let devices = $state<any[]>([]);
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let currentJti = $state<string | null>(null);

  function decodeToken() {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) {
      currentJti = null;
      return;
    }
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      const payload = JSON.parse(jsonPayload);
      currentJti = payload.jti;
    } catch (e) {
      console.error("Failed to decode token", e);
      currentJti = null;
    }
  }

  return {
    get devices() {
      return devices;
    },
    get isLoading() {
      return isLoading;
    },
    get error() {
      return error;
    },
    get currentJti() {
      return currentJti;
    },

    async loadDevices() {
      isLoading = true;
      error = null;
      decodeToken();

      try {
        const response = await deviceService.getDevices();
        // Map devices to include isCurrent flag locally or let view handle it
        // asking view to handle it is easier if we just expose currentJti
        devices = response.data.map((device: any) => ({
          ...device,
          isCurrent: device.jti === currentJti,
        }));
      } catch (err: any) {
        console.error("Failed to load devices:", err);
        error = err.message || "Failed to load devices";
        toast.error("Gagal memuat daftar device.");
        devices = [];
      } finally {
        isLoading = false;
      }
    },

    async revokeDevice(jti: string) {
      // Optimistic update or reload? Reload is safer for consistency.
      // But let's handle the call here.
      try {
        await deviceService.revokeDevice(jti);
        toast.success("Device berhasil dicabut.");
        // Reload to get fresh state
        await this.loadDevices();
      } catch (err: any) {
        console.error("Failed to revoke device:", err);
        toast.error("Gagal mencabut device.");
        throw err; // Re-throw so UI can handle specific UI states if needed (like revokingJti)
      }
    },
  };
}

export const deviceStore = createDeviceStore();
