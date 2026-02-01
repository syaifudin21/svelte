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

    async logout() {
      user = null;
      token = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
    },
  };
}

export const authStore = createAuthStore();
