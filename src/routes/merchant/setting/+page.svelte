<script lang="ts">
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "$lib/components/ui/tabs";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { User, Lock, Save, AlertCircle } from "lucide-svelte";
  import { accountService } from "$lib/services/account.service";
  import { toast } from "svelte-sonner";
  import { onMount } from "svelte";

  // Profile state
  let profile = $state({
    username: "",
    email: "",
    full_name: "",
    phone_number: "",
  });

  // Password state
  let passwordForm = $state({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  let isLoadingProfile = $state(false);
  let isLoadingPassword = $state(false);
  let isSavingProfile = $state(false);
  let isSavingPassword = $state(false);

  let profileErrors = $state<Record<string, string>>({});
  let passwordErrors = $state<Record<string, string>>({});
  let activeTab = $state("profile");
  let passwordErrorDialog = $state({ open: false, message: "" });

  // Password strength state
  let passwordStrength = $derived({
    hasMinLength: passwordForm.new_password.length >= 6,
    hasLetter: /[a-zA-Z]/.test(passwordForm.new_password),
    hasNumber: /[0-9]/.test(passwordForm.new_password),
    hasSymbol: /[^a-zA-Z0-9]/.test(passwordForm.new_password),
  });

  function getPasswordScore() {
    let score = 0;
    if (passwordStrength.hasMinLength) score++;
    if (passwordStrength.hasLetter) score++;
    if (passwordStrength.hasNumber) score++;
    if (passwordStrength.hasSymbol) score++;
    return score;
  }

  function getStrengthLabel() {
    const score = getPasswordScore();
    if (passwordForm.new_password.length === 0) return { text: "", color: "" };
    if (score <= 1) return { text: "Lemah", color: "text-red-600" };
    if (score === 2) return { text: "Sedang", color: "text-yellow-600" };
    if (score === 3) return { text: "Kuat", color: "text-blue-600" };
    return { text: "Sangat Kuat", color: "text-green-600" };
  }

  function getStrengthBarColor() {
    const score = getPasswordScore();
    if (score <= 1) return "bg-red-600";
    if (score === 2) return "bg-yellow-600";
    if (score === 3) return "bg-blue-600";
    return "bg-green-600";
  }

  onMount(async () => {
    await loadProfile();
  });

  async function loadProfile() {
    isLoadingProfile = true;
    try {
      const response = await accountService.getProfile();
      if (response.data) {
        profile = {
          username: response.data.username || "",
          email: response.data.email || "",
          full_name: response.data.full_name || "",
          phone_number: response.data.phone_number || "",
        };
      }
    } catch (err: any) {
      console.error("Failed to load profile:", err);
      toast.error("Gagal memuat profil");
    } finally {
      isLoadingProfile = false;
    }
  }

  function validateProfile(): boolean {
    profileErrors = {};

    if (!profile.username.trim()) {
      profileErrors.username = "Username wajib diisi";
    }

    if (!profile.email.trim()) {
      profileErrors.email = "Email wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      profileErrors.email = "Email tidak valid";
    }

    if (!profile.full_name.trim()) {
      profileErrors.full_name = "Nama lengkap wajib diisi";
    }

    if (!profile.phone_number.trim()) {
      profileErrors.phone_number = "Nomor telepon wajib diisi";
    } else if (profile.phone_number.replace(/\D/g, "").length < 10) {
      profileErrors.phone_number = "Nomor telepon minimal 10 digit";
    }

    return Object.keys(profileErrors).length === 0;
  }

  async function saveProfile() {
    if (!validateProfile()) return;

    isSavingProfile = true;
    try {
      await accountService.updateProfile({
        username: profile.username,
        email: profile.email,
        full_name: profile.full_name,
        phone_number: profile.phone_number,
      });
      toast.success("Profil berhasil diperbarui");
      profileErrors = {};
    } catch (err: any) {
      console.error("Failed to update profile:", err);
      toast.error(err.response?.data?.message || "Gagal memperbarui profil");
    } finally {
      isSavingProfile = false;
    }
  }

  function validatePassword(): boolean {
    passwordErrors = {};

    if (!passwordForm.current_password) {
      passwordErrors.current_password = "Password saat ini wajib diisi";
    }

    if (!passwordForm.new_password) {
      passwordErrors.new_password = "Password baru wajib diisi";
    } else if (!passwordStrength.hasMinLength) {
      passwordErrors.new_password = "Password baru minimal 6 karakter";
    } else if (getPasswordScore() < 3) {
      passwordErrors.new_password = "Gunakan kombinasi huruf, angka, dan simbol";
    }

    if (!passwordForm.confirm_password) {
      passwordErrors.confirm_password = "Konfirmasi password wajib diisi";
    } else if (passwordForm.new_password !== passwordForm.confirm_password) {
      passwordErrors.confirm_password = "Password tidak sama";
    }

    return Object.keys(passwordErrors).length === 0;
  }

  async function savePassword() {
    if (!validatePassword()) return;

    isSavingPassword = true;
    try {
      await accountService.updatePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      toast.success("Password berhasil diperbarui");
      passwordForm = {
        current_password: "",
        new_password: "",
        confirm_password: "",
      };
      passwordErrors = {};
    } catch (err: any) {
      console.error("Failed to update password:", err);
      const errorMsg = err.response?.data?.message || "Gagal memperbarui password";
      passwordErrorDialog = { open: true, message: errorMsg };
    } finally {
      isSavingPassword = false;
    }
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div>
    <h1 class="text-3xl font-bold tracking-tight">Pengaturan</h1>
    <p class="text-muted-foreground mt-1">Kelola pengaturan akun Anda</p>
  </div>

  <!-- Loading State -->
  {#if isLoadingProfile}
    <Card>
      <CardContent class="py-10 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p class="text-muted-foreground mt-4">Memuat profil...</p>
      </CardContent>
    </Card>
  {:else}
    <Tabs bind:value={activeTab} class="w-full">
      <TabsList class="grid w-full md:w-[400px] grid-cols-2">
        <TabsTrigger value="profile" class="gap-2">
          <User class="w-4 h-4" />
          Profil
        </TabsTrigger>
        <TabsTrigger value="password" class="gap-2">
          <Lock class="w-4 h-4" />
          Password
        </TabsTrigger>
      </TabsList>

      <!-- Profile Tab -->
      <TabsContent value="profile" class="space-y-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Profil</CardTitle>
            <CardDescription>
              Perbarui informasi profil dan kontak Anda
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label for="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Username"
                bind:value={profile.username}
                disabled={isSavingProfile}
                class={profileErrors.username ? "border-destructive" : ""}
              />
              {#if profileErrors.username}
                <p class="text-sm text-destructive">{profileErrors.username}</p>
              {/if}
            </div>

            <div class="space-y-2">
              <Label for="full_name">Nama Lengkap</Label>
              <Input
                id="full_name"
                type="text"
                placeholder="Nama Lengkap"
                bind:value={profile.full_name}
                disabled={isSavingProfile}
                class={profileErrors.full_name ? "border-destructive" : ""}
              />
              {#if profileErrors.full_name}
                <p class="text-sm text-destructive">{profileErrors.full_name}</p>
              {/if}
            </div>

            <div class="space-y-2">
              <Label for="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                bind:value={profile.email}
                disabled={isSavingProfile}
                class={profileErrors.email ? "border-destructive" : ""}
              />
              {#if profileErrors.email}
                <p class="text-sm text-destructive">{profileErrors.email}</p>
              {/if}
            </div>

            <div class="space-y-2">
              <Label for="phone_number">Nomor Telepon</Label>
              <Input
                id="phone_number"
                type="tel"
                placeholder="081234567890"
                bind:value={profile.phone_number}
                disabled={isSavingProfile}
                class={profileErrors.phone_number ? "border-destructive" : ""}
              />
              {#if profileErrors.phone_number}
                <p class="text-sm text-destructive">{profileErrors.phone_number}</p>
              {/if}
            </div>

            <Button onclick={saveProfile} disabled={isSavingProfile} class="w-full md:w-auto">
              {#if isSavingProfile}
                <span class="animate-spin mr-2">⏳</span>
                Menyimpan...
              {:else}
                <Save class="w-4 h-4 mr-2" />
                Simpan Perubahan
              {/if}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- Password Tab -->
      <TabsContent value="password" class="space-y-4 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Ubah Password</CardTitle>
            <CardDescription>
              Perbarui password akun Anda untuk keamanan
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="space-y-2">
              <Label for="current_password">Password Saat Ini</Label>
              <Input
                id="current_password"
                type="password"
                placeholder="Masukkan password saat ini"
                bind:value={passwordForm.current_password}
                disabled={isSavingPassword}
                class={passwordErrors.current_password ? "border-destructive" : ""}
              />
              {#if passwordErrors.current_password}
                <p class="text-sm text-destructive">{passwordErrors.current_password}</p>
              {/if}
            </div>

            <div class="space-y-2">
              <Label for="new_password">Password Baru</Label>
              <Input
                id="new_password"
                type="password"
                placeholder="Masukkan password baru"
                bind:value={passwordForm.new_password}
                disabled={isSavingPassword}
                class={passwordErrors.new_password ? "border-destructive" : ""}
              />
              {#if passwordForm.new_password.length > 0}
                {@const score = getPasswordScore()}
                <div class="space-y-2">
                  <!-- Strength Bar -->
                  <div class="flex gap-1">
                    {#each [0, 1, 2, 3] as i}
                      <div
                        class="h-1 flex-1 rounded-full transition-colors"
                        class:bg-red-600={i < score && score <= 1}
                        class:bg-yellow-600={i < score && score === 2}
                        class:bg-blue-600={i < score && score === 3}
                        class:bg-green-600={i < score && score === 4}
                        class:bg-gray-200={i >= score}
                      ></div>
                    {/each}
                  </div>
                  <div class="flex items-center justify-between text-xs">
                    <span class={getStrengthLabel().color}>
                      {getStrengthLabel().text}
                    </span>
                    <span class="text-muted-foreground">{score}/4 kriteria</span>
                  </div>
                  <!-- Requirements Checklist -->
                  <div class="grid grid-cols-2 gap-2 text-xs mt-2">
                    <div class="flex items-center gap-1.5">
                      <div class="w-4 h-4 rounded-full flex items-center justify-center"
                        class:bg-green-100={passwordStrength.hasMinLength}
                        class:bg-gray-100={!passwordStrength.hasMinLength}
                      >
                        {#if passwordStrength.hasMinLength}
                          <svg class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                          </svg>
                        {:else}
                          <span class="text-gray-400">•</span>
                        {/if}
                      </div>
                      <span class={passwordStrength.hasMinLength ? "text-green-600" : "text-muted-foreground"}>
                        Minimal 6 karakter
                      </span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <div class="w-4 h-4 rounded-full flex items-center justify-center"
                        class:bg-green-100={passwordStrength.hasLetter}
                        class:bg-gray-100={!passwordStrength.hasLetter}
                      >
                        {#if passwordStrength.hasLetter}
                          <svg class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                          </svg>
                        {:else}
                          <span class="text-gray-400">•</span>
                        {/if}
                      </div>
                      <span class={passwordStrength.hasLetter ? "text-green-600" : "text-muted-foreground"}>
                        Huruf (a-z, A-Z)
                      </span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <div class="w-4 h-4 rounded-full flex items-center justify-center"
                        class:bg-green-100={passwordStrength.hasNumber}
                        class:bg-gray-100={!passwordStrength.hasNumber}
                      >
                        {#if passwordStrength.hasNumber}
                          <svg class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                          </svg>
                        {:else}
                          <span class="text-gray-400">•</span>
                        {/if}
                      </div>
                      <span class={passwordStrength.hasNumber ? "text-green-600" : "text-muted-foreground"}>
                        Angka (0-9)
                      </span>
                    </div>
                    <div class="flex items-center gap-1.5">
                      <div class="w-4 h-4 rounded-full flex items-center justify-center"
                        class:bg-green-100={passwordStrength.hasSymbol}
                        class:bg-gray-100={!passwordStrength.hasSymbol}
                      >
                        {#if passwordStrength.hasSymbol}
                          <svg class="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
                          </svg>
                        {:else}
                          <span class="text-gray-400">•</span>
                        {/if}
                      </div>
                      <span class={passwordStrength.hasSymbol ? "text-green-600" : "text-muted-foreground"}>
                        Simbol (!@#$%^&*)
                      </span>
                    </div>
                  </div>
                </div>
              {/if}
              {#if passwordErrors.new_password}
                <p class="text-sm text-destructive">{passwordErrors.new_password}</p>
              {/if}
            </div>

            <div class="space-y-2">
              <Label for="confirm_password">Konfirmasi Password Baru</Label>
              <Input
                id="confirm_password"
                type="password"
                placeholder="Ulangi password baru"
                bind:value={passwordForm.confirm_password}
                disabled={isSavingPassword}
                class={passwordErrors.confirm_password ? "border-destructive" : ""}
              />
              {#if passwordErrors.confirm_password}
                <p class="text-sm text-destructive">{passwordErrors.confirm_password}</p>
              {/if}
            </div>

            <Button onclick={savePassword} disabled={isSavingPassword} class="w-full md:w-auto">
              {#if isSavingPassword}
                <span class="animate-spin mr-2">⏳</span>
                Menyimpan...
              {:else}
                <Save class="w-4 h-4 mr-2" />
                Ubah Password
              {/if}
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  {/if}
</div>

<!-- Password Error Dialog -->
<AlertDialog.Root open={passwordErrorDialog.open}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Gagal Memperbarui Password</AlertDialog.Title>
      <AlertDialog.Description>
        {passwordErrorDialog.message}
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Action onclick={() => passwordErrorDialog = { open: false, message: "" }}>
        OK
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
