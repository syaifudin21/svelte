<script lang="ts">
  import { notificationService } from "$lib/services/notification.service";
  import { userService } from "$lib/services/user.service";
  import type { User } from "$lib/types/user";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
  import { toast } from "svelte-sonner";
  import { onMount } from "svelte";
  import { getFcmToken } from "$lib/utils/firebase";
  import { deviceService } from "$lib/services/device.service";
  import { clickOutside } from "$lib/hooks/click-outside.svelte";

  let singleUser = $state<User | null>(null);
  let singleUserId = $state("");
  let singleTitle = $state("");
  let singleBody = $state("");

  let bulkUserIds = $state("");
  let bulkTitle = $state("");
  let bulkBody = $state("");

  let currentFcmToken = $state("");

  let searchQuery = $state("");
  let searchResults = $state<User[]>([]);
  let isSearching = $state(false);
  let searchOpen = $state(false);
  let searchContainer: HTMLDivElement;

  let searchTimeout: ReturnType<typeof setTimeout>;

  onMount(() => {
    currentFcmToken = localStorage.getItem("fcm_token") || "Token not found";
  });

  let isLoadingSingle = $state(false);
  let isLoadingBulk = $state(false);
  let isLoadingTest = $state(false);

  function debouncedSearch(query: string) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchUsers(query);
    }, 300);
  }

  async function searchUsers(query: string) {
    if (!query || query.length < 2) {
      searchResults = [];
      return;
    }

    isSearching = true;
    try {
      const res = await userService.searchUsers({ search: query, per_page: 10 });
      searchResults = res.data.items || [];
    } catch (error: any) {
      console.error("Search error:", error);
      searchResults = [];
    } finally {
      isSearching = false;
    }
  }

  function handleUserSelect(user: User) {
    singleUser = user;
    singleUserId = String(user.id);
    searchOpen = false;
    searchQuery = `${user.username} (${user.email})`;
    searchResults = [];
  }

  function closeSearch() {
    searchOpen = false;
  }

  async function handleSendToUser() {
    if (!singleUserId || !singleTitle || !singleBody) {
      toast.error("Semua field harus diisi");
      return;
    }

    isLoadingSingle = true;
    try {
      const res = await notificationService.sendToUser(
        parseInt(singleUserId),
        singleTitle,
        singleBody,
      );
      if (res.data?.sent > 0) {
        toast.success(
          `${res.message} (Sent: ${res.data.sent}/${res.data.total})`,
        );
        singleUserId = "";
        singleUser = null;
        singleTitle = "";
        singleBody = "";
        searchQuery = "";
      } else {
        toast.warning(
          `Gagal! ${res.message} (Sent: 0). User mungkin tidak punya perangkat terdaftar.`,
        );
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengirim notifikasi");
    } finally {
      isLoadingSingle = false;
    }
  }

  async function handleSendBulk() {
    if (!bulkUserIds || !bulkTitle || !bulkBody) {
      toast.error("Semua field harus diisi");
      return;
    }

    const ids = bulkUserIds
      .split(",")
      .map((id) => parseInt(id.trim()))
      .filter((id) => !isNaN(id));
    if (ids.length === 0) {
      toast.error("User IDs tidak valid");
      return;
    }

    isLoadingBulk = true;
    try {
      const res = await notificationService.sendBulk(ids, bulkTitle, bulkBody);
      if (res.data?.sent > 0) {
        toast.success(
          `${res.message} (Sent: ${res.data.sent}/${res.data.total})`,
        );
        bulkUserIds = "";
        bulkTitle = "";
        bulkBody = "";
      } else {
        toast.warning(
          `Gagal! ${res.message} (Sent: 0). Pastikan User IDs memiliki perangkat terdaftar.`,
        );
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mengirim notifikasi");
    } finally {
      isLoadingBulk = false;
    }
  }

  async function handleTestNotification() {
    isLoadingTest = true;
    try {
      const res = await notificationService.testNotification();
      console.log("Test Notification Response:", res);
      if (res.data?.sent > 0) {
        toast.success(
          `Berhasil! ${res.message} (Sent: ${res.data.sent}/${res.data.total})`,
        );
      } else {
        toast.warning(
          `Terkirim 0! ${res.message} (Total Token: ${res.data.total}). Pastikan Anda sudah Logout & Login kembali.`,
        );
      }
    } catch (error: any) {
      console.error("Test Notification Error:", error);
      toast.error(
        error.response?.data?.message || "Gagal mengirim notifikasi tes",
      );
    } finally {
      isLoadingTest = false;
    }
  }

  let isSyncing = $state(false);
  async function handleSyncToken() {
    isSyncing = true;
    try {
      const token = await getFcmToken();
      if (token) {
        await deviceService.updateFcmToken(token);
        currentFcmToken = token;
        toast.success("Token FCM berhasil disinkronkan ke server");
      } else {
        toast.error("Gagal mendapatkan Token FCM dari browser");
      }
    } catch (error: any) {
      toast.error(
        "Gagal sinkronisasi: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      isSyncing = false;
    }
  }

  let deviceStatus = $state<any[]>([]);
  let isLoadingStatus = $state(false);

  async function checkDeviceStatus() {
    isLoadingStatus = true;
    try {
      const res = await deviceService.getMyDevices();
      deviceStatus = res.data;
      toast.success(`Ditemukan ${deviceStatus.length} sesi perangkat aktif`);
    } catch (error: any) {
      toast.error(
        "Gagal cek status: " + (error.response?.data?.message || error.message),
      );
    } finally {
      isLoadingStatus = false;
    }
  }
</script>

<div class="flex flex-1 flex-col">
  <div class="@container/main flex flex-1 flex-col gap-2">
    <div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div class="px-4 lg:px-6">
        <h1 class="text-2xl font-bold">Notifications</h1>
        <p class="text-muted-foreground">
          Manage and send push notifications to users.
        </p>
      </div>

      <div class="grid gap-4 px-4 lg:grid-cols-2 lg:px-6">
        <!-- Single Notification -->
        <Card.Root>
          <Card.Header>
            <Card.Title>Send to Single User</Card.Title>
            <Card.Description
              >Send a notification to a specific user by their ID.</Card.Description
            >
          </Card.Header>
          <Card.Content class="space-y-4">
            <div class="space-y-2">
              <Label for="userId">User</Label>
              <div class="relative" use:clickOutside={closeSearch}>
                <Input
                  id="userId"
                  placeholder="Search user by username or email..."
                  bind:value={searchQuery}
                  oninput={(e) => {
                    const target = e.target as HTMLInputElement;
                    searchQuery = target.value;
                    debouncedSearch(target.value);
                    searchOpen = true;
                  }}
                  onfocus={() => {
                    if (searchQuery.length >= 2 && searchResults.length > 0) {
                      searchOpen = true;
                    }
                  }}
                />
                {#if singleUser}
                  <Button
                    variant="ghost"
                    size="sm"
                    class="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onclick={() => {
                      singleUser = null;
                      singleUserId = "";
                      searchQuery = "";
                      searchResults = [];
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="text-muted-foreground"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                  </Button>
                {/if}

                {#if searchOpen && (isSearching || searchResults.length > 0)}
                  <div
                    class="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md max-h-64 overflow-auto"
                  >
                    {#if isSearching}
                      <div class="flex items-center justify-center py-4">
                        <span class="text-sm text-muted-foreground">
                          Searching...
                        </span>
                      </div>
                    {:else}
                      {#each searchResults as user (user.id)}
                        <button
                          class="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none transition-colors"
                          onclick={() => handleUserSelect(user)}
                        >
                          <div class="flex flex-col gap-0.5">
                            <span class="font-medium">{user.username}</span>
                            <span class="text-xs text-muted-foreground">
                              {user.email}
                            </span>
                          </div>
                        </button>
                      {/each}
                    {/if}
                  </div>
                {/if}
              </div>
              <p class="text-xs text-muted-foreground">
                Type at least 2 characters to search (e.g., username or email)
              </p>
              {#if singleUser}
                <p class="text-xs text-green-600 dark:text-green-400">
                  Selected: {singleUser.username} ({singleUser.email})
                </p>
              {/if}
            </div>
            <div class="space-y-2">
              <Label for="title">Title</Label>
              <Input
                id="title"
                placeholder="Notification Title"
                bind:value={singleTitle}
              />
            </div>
            <div class="space-y-2">
              <Label for="body">Body</Label>
              <Textarea
                id="body"
                placeholder="Notification Message"
                bind:value={singleBody}
              />
            </div>
          </Card.Content>
          <Card.Footer>
            <Button
              class="w-full"
              disabled={isLoadingSingle}
              onclick={handleSendToUser}
            >
              {isLoadingSingle ? "Sending..." : "Send Notification"}
            </Button>
          </Card.Footer>
        </Card.Root>

        <!-- Bulk Notification -->
        <Card.Root>
          <Card.Header>
            <Card.Title>Send Bulk Notification</Card.Title>
            <Card.Description
              >Send a notification to multiple users (comma-separated IDs).</Card.Description
            >
          </Card.Header>
          <Card.Content class="space-y-4">
            <div class="space-y-2">
              <Label for="userIds">User IDs (comma separated)</Label>
              <Input
                id="userIds"
                placeholder="101, 102, 103"
                bind:value={bulkUserIds}
              />
            </div>
            <div class="space-y-2">
              <Label for="bulkTitle">Title</Label>
              <Input
                id="bulkTitle"
                placeholder="Notification Title"
                bind:value={bulkTitle}
              />
            </div>
            <div class="space-y-2">
              <Label for="bulkBody">Body</Label>
              <Textarea
                id="bulkBody"
                placeholder="Notification Message"
                bind:value={bulkBody}
              />
            </div>
          </Card.Content>
          <Card.Footer>
            <Button
              class="w-full"
              disabled={isLoadingBulk}
              onclick={handleSendBulk}
            >
              {isLoadingBulk ? "Sending..." : "Send Bulk Notification"}
            </Button>
          </Card.Footer>
        </Card.Root>

        <!-- Test Notification -->
        <Card.Root class="lg:col-span-2">
          <Card.Header>
            <Card.Title>Test Notification</Card.Title>
            <Card.Description
              >Trigger a test notification to verify system configuration.</Card.Description
            >
          </Card.Header>
          <Card.Content>
            <p class="text-sm text-muted-foreground">
              This will send a default test notification to relevant test
              devices/users.
            </p>
          </Card.Content>
          <Card.Footer>
            <Button
              variant="outline"
              class="w-full"
              disabled={isLoadingTest}
              onclick={handleTestNotification}
            >
              {isLoadingTest ? "Testing..." : "Run Test Notification"}
            </Button>
          </Card.Footer>
        </Card.Root>

        <!-- Device Registration Status -->
        <Card.Root>
          <Card.Header>
            <Card.Title>Device Registration Status</Card.Title>
            <Card.Description
              >Check your registered devices on the server.</Card.Description
            >
          </Card.Header>
          <Card.Content>
            {#if deviceStatus.length > 0}
              <div class="space-y-2">
                {#each deviceStatus as device}
                  <div class="p-2 border rounded text-xs">
                    <div class="font-bold">{device.jti.substring(0, 8)}...</div>
                    <div class="text-muted-foreground truncate">
                      Token: {device.fcm_token ? "Exists" : "MISSING"}
                    </div>
                    <div class="text-muted-foreground">
                      Updated: {new Date(device.updated_at).toLocaleString()}
                    </div>
                  </div>
                {/each}
              </div>
            {:else}
              <p class="text-sm text-muted-foreground">No devices loaded.</p>
            {/if}
          </Card.Content>
          <Card.Footer>
            <Button
              variant="outline"
              class="w-full"
              disabled={isLoadingStatus}
              onclick={checkDeviceStatus}
            >
              {isLoadingStatus ? "Checking..." : "Check Status"}
            </Button>
          </Card.Footer>
        </Card.Root>

        <!-- FCM Token Debug -->
        <Card.Root>
          <Card.Header>
            <Card.Title>FCM Token Debug</Card.Title>
            <Card.Description
              >Your current FCM token for this browser session.</Card.Description
            >
          </Card.Header>
          <Card.Content>
            <div class="space-y-2">
              <Label for="fcmToken">FCM Token</Label>
              <Textarea
                id="fcmToken"
                readonly
                value={currentFcmToken}
                class="h-24 font-mono text-xs"
              />
              <Button
                variant="ghost"
                size="sm"
                class="h-8 px-2 text-xs"
                onclick={() => {
                  navigator.clipboard.writeText(currentFcmToken);
                  toast.success("Token dikopi ke clipboard");
                }}
              >
                Copy Token
              </Button>
              <Button
                variant="outline"
                size="sm"
                class="h-8 px-2 text-xs"
                disabled={isSyncing}
                onclick={handleSyncToken}
              >
                {isSyncing ? "Syncing..." : "Sync Token Manual"}
              </Button>
            </div>
          </Card.Content>
        </Card.Root>
      </div>
    </div>
  </div>
</div>
