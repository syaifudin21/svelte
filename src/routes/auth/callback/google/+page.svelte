<script lang="ts">
  import { onMount } from "svelte";
  import { page } from "$app/stores";
  import { authService } from "$lib/services/auth.service";
  import { authStore } from "$lib/stores/auth.svelte";
  import { goto } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import RoleSelectionDialog from "$lib/components/role-selection-dialog.svelte";

  let showRoleDialog = $state(false);

  onMount(async () => {
    const code = $page.url.searchParams.get("code");
    const error = $page.url.searchParams.get("error");

    if (error) {
      authStore.setError(`Google Login Error: ${error}`);
      goto("/login");
      return;
    }

    if (!code) {
      console.error("Google OAuth code not found in URL");
      authStore.setError(
        "Login Google gagal: Parameter 'code' tidak ditemukan.",
      );
      goto("/login");
      return;
    }

    console.log("Google OAuth Code receiver:", code);
    authStore.setLoading(true);
    try {
      const storedToken = localStorage.getItem("fcm_token");
      console.log(
        "Google Callback: Stored fcm_token in localStorage:",
        storedToken,
      );

      const fcm_token = storedToken || "";
      console.log("Google Callback: Final fcm_token to be sent:", fcm_token);

      // Send the code to the backend to get the token and user data
      const response = await authService.loginWithGoogle({ code, fcm_token });
      console.log("Backend Google Login Response:", response);

      const token = response.data?.token;
      const userData = response.data?.user;

      if (!token || !userData) {
        authStore.setError("Respon server tidak valid.");
        goto("/login");
        return;
      }

      // Set session
      authStore.setUser(userData);
      authStore.setToken(token);

      toast.success(response.message || "Login Google berhasil!");
      showRoleDialog = true;
    } catch (err: any) {
      console.error("Backend Google Login Error:", err.response?.data || err);
      const errorMsg =
        err.response?.data?.message || "Login Google gagal. Silakan coba lagi.";
      authStore.setError(errorMsg);
      goto("/login");
    } finally {
      authStore.setLoading(false);
    }
  });
</script>

<div class="flex h-screen items-center justify-center">
  <div class="text-center">
    <h2 class="text-xl font-semibold">Memproses Login Google...</h2>
    <p class="text-muted-foreground">Silakan tunggu sebentar.</p>
  </div>
</div>

<RoleSelectionDialog bind:open={showRoleDialog} />
