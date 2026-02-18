import { authService } from "$lib/services/auth.service";
import { userService } from "$lib/services/user.service";

export function createAuthStore() {
  let user = $state<any>(null);
  let token = $state<string | null>(
    typeof window !== "undefined" ? localStorage.getItem("token") : null,
  );
  let isLoading = $state(false);
  let error = $state<string | null>(null);

  return {
    get user() {
      return user;
    },
    get token() {
      return token;
    },
    get isLoading() {
      return isLoading;
    },
    get error() {
      return error;
    },

    setUser(newUser: any) {
      user = newUser;
    },

    setToken(newToken: string | null) {
      token = newToken;
      if (typeof window !== "undefined") {
        if (newToken) {
          localStorage.setItem("token", newToken);
        } else {
          localStorage.removeItem("token");
        }
      }
    },

    setLoading(status: boolean) {
      isLoading = status;
    },

    setError(msg: string | null) {
      error = msg;
    },

    async fetchProfile() {
      isLoading = true;
      try {
        const response = await userService.getProfile();
        user = response.data;
      } catch (err) {
        console.error("Failed to fetch profile:", err);
        // Don't clear token on profile fetch failure unless 401 (handled by interceptor)
      } finally {
        isLoading = false;
      }
    },

    async logout() {
      try {
        await authService.logout();
      } catch (err) {
        console.error("Logout API call failed:", err);
      } finally {
        user = null;
        token = null;
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
        }
      }
    },
  };
}

export const authStore = createAuthStore();
