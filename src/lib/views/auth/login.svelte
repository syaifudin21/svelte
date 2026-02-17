<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { cn } from "$lib/utils";
  import { authService } from "$lib/services/auth.service";
  import { authStore } from "$lib/stores/auth.svelte";
  import { goto } from "$app/navigation";
  import { toast } from "svelte-sonner";
  import { env } from "$env/dynamic/public";
  import RoleSelectionDialog from "$lib/components/role-selection-dialog.svelte";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Eye, EyeOff } from "lucide-svelte";

  let username = $state("");
  let password = $state("");
  let showPassword = $state(false);
  let showRoleDialog = $state(false);
  let showErrorDialog = $state(false);
  let errorMessage = $state("");

  function getDeviceInfo() {
    return navigator.userAgent;
  }

  async function handleLogin(e: SubmitEvent) {
    e.preventDefault();
    authStore.setLoading(true);
    authStore.setError(null);

    try {
      const storedToken = localStorage.getItem("fcm_token");
      const fcm_token = storedToken || "";
      const deviceInfo = getDeviceInfo();

      const response = await authService.login({
        username,
        password,
        fcm_token,
        device_info: deviceInfo,
      });

      const token = response.data?.token;
      const userData = response.data?.user;

      if (!token || !userData) {
        authStore.setError("Respon server tidak valid.");
        return;
      }

      // Set session
      authStore.setUser(userData);
      authStore.setToken(token);

      toast.success(response.message || "Login berhasil!");

      // Tampilkan dialog pemilihan role
      showRoleDialog = true;
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      authStore.setError(msg);
      errorMessage = msg;
      showErrorDialog = true;
    } finally {
      authStore.setLoading(false);
    }
  }

  function handleGoogleLogin() {
    const clientId = env.PUBLIC_GOOGLE_CLIENT_ID;

    if (!clientId || clientId.includes("your-google-client-id")) {
      toast.error("Google Client ID belum dikonfigurasi di file .env.");
      return;
    }

    // Simpan flag agar callback tahu harus tampilkan RoleSelectionDialog
    sessionStorage.setItem("pending_role_selection", "true");

    const redirectUri = encodeURIComponent(
      window.location.origin + "/auth/callback/google",
    );
    const scope = encodeURIComponent("openid email profile");
    const responseType = "code";

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=${responseType}`;

    window.location.href = googleAuthUrl;
  }
</script>

<!-- Desktop Layout -->
<div
  class="container relative hidden h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0"
>
  <!-- Left Panel -->
  <div
    class="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex"
  >
    <div class="absolute inset-0 bg-zinc-900"></div>
    <div class="relative z-20 flex items-center text-lg font-medium">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="mr-2 h-6 w-6"
      >
        <path
          d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"
        />
      </svg>
      Acme Inc
    </div>
    <div class="relative z-20 mt-auto">
      <blockquote class="space-y-2">
        <p class="text-lg">
          &ldquo;This library has saved me countless hours of work and helped me
          deliver stunning designs to my clients faster than ever before.&rdquo;
        </p>
        <footer class="text-sm">Sofia Davis</footer>
      </blockquote>
    </div>
  </div>

  <!-- Right Panel (Form) -->
  <div class="lg:p-8">
    <div
      class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]"
    >
      <div class="flex flex-col space-y-2 text-center">
        <h1 class="text-2xl font-semibold tracking-tight">
          Login to your account
        </h1>
        <p class="text-sm text-muted-foreground">
          Enter your credentials below to login
        </p>
      </div>

      <div class={cn("grid gap-6")}>
        <form onsubmit={handleLogin}>
          <div class="grid gap-2">
            <div class="grid gap-1">
              <Label class="sr-only" for="username">Username</Label>
              <Input
                id="username"
                placeholder="Username"
                type="text"
                bind:value={username}
                required
                disabled={authStore.isLoading}
              />
            </div>
            <div class="grid gap-1">
              <Label class="sr-only" for="password">Password</Label>
              <div class="relative">
                <Input
                  id="password"
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  bind:value={password}
                  required
                  disabled={authStore.isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onclick={() => (showPassword = !showPassword)}
                  disabled={authStore.isLoading}
                >
                  {#if showPassword}
                    <EyeOff class="h-4 w-4 text-muted-foreground" />
                  {:else}
                    <Eye class="h-4 w-4 text-muted-foreground" />
                  {/if}
                </Button>
              </div>
            </div>
            {#if authStore.error}
              <p class="text-sm font-medium text-destructive">
                {authStore.error}
              </p>
            {/if}
            <Button type="submit" disabled={authStore.isLoading}>
              {#if authStore.isLoading}
                Logging in...
              {:else}
                Sign In
              {/if}
            </Button>
          </div>
        </form>

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t"></span>
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <!-- Google Login -->
        <Button
          variant="outline"
          type="button"
          disabled={authStore.isLoading}
          onclick={handleGoogleLogin}
        >
          <svg role="img" viewBox="0 0 24 24" class="mr-2 h-4 w-4">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </Button>
      </div>

      <p class="px-8 text-center text-sm text-muted-foreground">
        By clicking continue, you agree to our{" "}
        <a
          href="/terms"
          class="underline underline-offset-4 hover:text-primary"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="/privacy"
          class="underline underline-offset-4 hover:text-primary"
        >
          Privacy Policy
        </a>
        .
      </p>
    </div>
  </div>
</div>

<!-- Mobile Layout -->
<div
  class="flex flex-col md:hidden min-h-screen items-center justify-center p-4"
>
  <div
    class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]"
  >
    <div class="flex flex-col space-y-2 text-center">
      <h1 class="text-2xl font-semibold tracking-tight">Login</h1>
      <p class="text-sm text-muted-foreground">
        Enter your credentials to login
      </p>
    </div>
    <div class="grid gap-6">
      <form onsubmit={handleLogin}>
        <div class="grid gap-2">
          <div class="grid gap-1">
            <Label class="sr-only" for="username-mobile">Username</Label>
            <Input
              id="username-mobile"
              placeholder="Username"
              type="text"
              bind:value={username}
              required
              disabled={authStore.isLoading}
            />
          </div>
          <div class="grid gap-1">
            <Label class="sr-only" for="password-mobile">Password</Label>
            <div class="relative">
              <Input
                id="password-mobile"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                bind:value={password}
                required
                disabled={authStore.isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                class="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onclick={() => (showPassword = !showPassword)}
                disabled={authStore.isLoading}
              >
                {#if showPassword}
                  <EyeOff class="h-4 w-4 text-muted-foreground" />
                {:else}
                  <Eye class="h-4 w-4 text-muted-foreground" />
                {/if}
              </Button>
            </div>
          </div>
          {#if authStore.error}
            <p class="text-sm font-medium text-destructive">
              {authStore.error}
            </p>
          {/if}
          <Button type="submit" disabled={authStore.isLoading}>
            {#if authStore.isLoading}
              Logging in...
            {:else}
              Sign In
            {/if}
          </Button>
        </div>
      </form>

      <!-- Google Login Mobile -->
      <Button
        variant="outline"
        type="button"
        disabled={authStore.isLoading}
        onclick={handleGoogleLogin}
      >
        <svg role="img" viewBox="0 0 24 24" class="mr-2 h-4 w-4">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Google
      </Button>
    </div>
  </div>
</div>

<!-- Role Selection Dialog (muncul setelah login berhasil, baik username/password maupun Google) -->
<RoleSelectionDialog bind:open={showRoleDialog} />

<!-- Error Dialog -->
<AlertDialog.Root open={showErrorDialog}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Login Gagal</AlertDialog.Title>
      <AlertDialog.Description>
        {errorMessage}
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Action onclick={() => (showErrorDialog = false)}>
        OK
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
