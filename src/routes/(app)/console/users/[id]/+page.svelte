<script lang="ts">
  import { page } from "$app/stores";
  import { userStore } from "$lib/stores/user.svelte";
  import { uiStore } from "$lib/stores/ui.svelte";
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import * as Avatar from "$lib/components/ui/avatar";
  import * as Table from "$lib/components/ui/table";
  import { Separator } from "$lib/components/ui/separator";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "$lib/components/ui/tabs";
  import {
    ArrowLeft,
    User,
    Mail,
    Shield,
    MapPin,
    Store,
    Bike,
    Star,
    Gift,
    RefreshCw,
    Clock,
  } from "lucide-svelte";
  import { onMount } from "svelte";

  let userId = $state("");

  $effect(() => {
    userId = $state.snapshot($page.params.id);
    if (userId) {
      userStore.fetchUserDetail(userId);
      uiStore.setBreadcrumbs([
        { label: uiStore.t("sidebar.dashboard"), href: "/dashboard" },
        { label: "User Management", href: "/console/users" },
        { label: `User #${userId}` },
      ]);
    }
  });

  onMount(() => {
    return () => {
      userStore.resetUserDetail();
    };
  });

  function formatDate(dateString: string): string {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function getRoleBadgeVariant(role: string): "default" | "secondary" | "destructive" | "outline" {
    switch (role) {
      case "admin":
        return "destructive";
      case "merchant":
        return "default";
      case "driver":
        return "secondary";
      default:
        return "outline";
    }
  }
</script>

<div class="space-y-6">
  <div class="flex items-center gap-4">
    <Button variant="ghost" size="icon" as="a" href="/console/users">
      <ArrowLeft class="h-5 w-5" />
    </Button>
    <div>
      <h1 class="text-2xl font-bold">User Details</h1>
      <p class="text-muted-foreground">View detailed information about this user</p>
    </div>
  </div>

  {#if userStore.isLoading}
    <div class="flex h-[400px] items-center justify-center">
      <RefreshCw class="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  {:else if userStore.error}
    <Card.Root>
      <Card.Content class="flex h-[400px] flex-col items-center justify-center gap-4">
        <p class="text-destructive">{userStore.error}</p>
        <Button onclick={() => userStore.fetchUserDetail(userId)}>Coba Lagi</Button>
      </Card.Content>
    </Card.Root>
  {:else if userStore.userDetail}
    <div class="grid gap-6 md:grid-cols-3">
      <Card.Root class="md:col-span-2">
        <Card.Header>
          <Card.Title>User Information</Card.Title>
        </Card.Header>
        <Card.Content>
          <div class="flex items-start gap-4">
            <Avatar.Root class="h-16 w-16">
              <Avatar.Fallback>
                <User class="h-8 w-8" />
              </Avatar.Fallback>
            </Avatar.Root>
            <div class="space-y-1">
              <h2 class="text-xl font-bold">{userStore.userDetail.username}</h2>
              <div class="flex gap-2">
                {#each userStore.userDetail.roles as role}
                  <Badge variant={getRoleBadgeVariant(role)}>{role}</Badge>
                {/each}
              </div>
            </div>
          </div>

          <Separator class="my-4" />

          <div class="grid gap-4 md:grid-cols-2">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <User class="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p class="text-sm text-muted-foreground">User ID</p>
                <p class="font-medium">{userStore.userDetail.id}</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Mail class="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p class="text-sm text-muted-foreground">Email</p>
                <p class="font-medium">{userStore.userDetail.email || "-"}</p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                <Shield class="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p class="text-sm text-muted-foreground">UUID</p>
                <p class="font-medium text-xs">{userStore.userDetail.uuid}</p>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card.Root>

      {#if userStore.userDetail.customer}
        <Card.Root>
          <Card.Header>
            <Card.Title class="flex items-center gap-2">
              <Gift class="h-5 w-5" />
              Customer Info
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Loyalty Points</span>
                <span class="font-medium">{userStore.userDetail.customer.loyalty_points}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Total Ratings</span>
                <span class="font-medium">{userStore.userDetail.customer.total_ratings}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-muted-foreground">Joined</span>
                <span class="font-medium text-xs">{formatDate(userStore.userDetail.customer.created_at)}</span>
              </div>
            </div>
          </Card.Content>
        </Card.Root>
      {/if}

      {#if userStore.userDetail.admin}
        <Card.Root class="md:col-span-3">
          <Card.Header>
            <Card.Title class="flex items-center gap-2">
              <Shield class="h-5 w-5" />
              Admin Information
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <div class="grid gap-6 md:grid-cols-3">
              <div class="space-y-4">
                <div>
                  <p class="text-sm text-muted-foreground">Name</p>
                  <p class="font-medium">{userStore.userDetail.admin.name}</p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Admin Type</p>
                  <Badge variant="outline">{userStore.userDetail.admin.admin_type}</Badge>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Status</p>
                  <Badge
                    variant={userStore.userDetail.admin.status === "approved"
                      ? "default"
                      : userStore.userDetail.admin.status === "rejected"
                        ? "destructive"
                        : "secondary"}
                  >
                    {userStore.userDetail.admin.status}
                  </Badge>
                </div>
              </div>

              <div class="space-y-4 md:col-span-2">
                <div>
                  <p class="text-sm text-muted-foreground mb-2">Work Area</p>
                  <div class="flex flex-wrap gap-2">
                    {#each userStore.userDetail.admin.work_area as area}
                      <Badge variant="secondary" class="flex items-center gap-1">
                        <MapPin class="h-3 w-3" />
                        {area.name}
                      </Badge>
                    {/each}
                  </div>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Created At</p>
                  <p class="text-sm">{formatDate(userStore.userDetail.admin.created_at)}</p>
                </div>
              </div>
            </div>
          </Card.Content>
        </Card.Root>
      {/if}

      {#if userStore.userDetail.merchant}
        <Card.Root class="md:col-span-3">
          <Card.Header>
            <Card.Title class="flex items-center gap-2">
              <Store class="h-5 w-5" />
              Merchant Information
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <p class="text-muted-foreground">Merchant ID: {userStore.userDetail.merchant.id}</p>
          </Card.Content>
        </Card.Root>
      {/if}

      {#if userStore.userDetail.driver}
        <Card.Root class="md:col-span-3">
          <Card.Header>
            <Card.Title class="flex items-center gap-2">
              <Bike class="h-5 w-5" />
              Driver Information
            </Card.Title>
          </Card.Header>
          <Card.Content>
            <p class="text-muted-foreground">Driver ID: {userStore.userDetail.driver.id}</p>
          </Card.Content>
        </Card.Root>
      {/if}
    </div>
  {:else}
    <Card.Root>
      <Card.Content class="flex h-[400px] flex-col items-center justify-center gap-4">
        <p class="text-muted-foreground">User not found</p>
        <Button as="a" href="/console/users">Back to Users</Button>
      </Card.Content>
    </Card.Root>
  {/if}
</div>
