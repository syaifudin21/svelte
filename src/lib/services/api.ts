import axios from "axios";
import { env } from "$env/dynamic/public";
import { showForbiddenDialog } from "$lib/stores/forbidden.svelte";

const api = axios.create({
  baseURL: env.PUBLIC_API_URL || "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const rawToken = localStorage.getItem("token");
      const token = rawToken?.trim();
      const lang = localStorage.getItem("language") || "en";

      if (config.headers && typeof config.headers.set === "function") {
        config.headers.set("Accept-Language", lang);
        if (token) config.headers.set("Authorization", `Bearer ${token}`);
        console.log(
          `Interceptor: Headers set (Lang: ${lang}, Auth: ${!!token})`,
        );
      } else {
        config.headers["Accept-Language"] = lang;
        if (token) config.headers.Authorization = `Bearer ${token}`;
        console.log(`Interceptor: Headers set direct (Lang: ${lang})`);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    }
    
    // Handle 403 Forbidden - No access permission
    if (error.response?.status === 403) {
      if (typeof window !== "undefined") {
        const errorMessage = error.response?.data?.message;
        showForbiddenDialog(
          errorMessage ? "Akses Ditolak" : undefined,
          errorMessage || undefined
        );
      }
    }
    
    return Promise.reject(error);
  },
);

export default api;
