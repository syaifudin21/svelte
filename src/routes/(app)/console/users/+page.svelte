<script lang="ts">
  import { userStore } from "$lib/stores/user.svelte";
  import { uiStore } from "$lib/stores/ui.svelte";
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import * as Table from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";
  import * as Avatar from "$lib/components/ui/avatar";
  import { Tabs, TabsList, TabsTrigger } from "$lib/components/ui/tabs";
  import { Search, MoreHorizontal, User, RefreshCw } from "lucide-svelte";
  import { onMount } from "svelte";

  let searchTerm = $state("");
  let currentPage = $state(1);
  let selectedRole = $state("all");

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    searchTerm = params.get("search") || "";
    currentPage = parseInt(params.get("page") || "1");
    selectedRole = params.get("role") || "all";

    userStore.fetchUsers(searchTerm, currentPage);
    uiStore.setBreadcrumbs([
      { label: uiStore.t("sidebar.dashboard"), href: "/dashboard" },
      { label: "User Management" },
    ]);
  });

  function updateUrl(search: string, page: number, role: string) {
    const url = new URL(window.location.href);
    if (search) {
      url.searchParams.set("search", search);
    } else {
      url.searchParams.delete("search");
    }

    if (page > 1) {
      url.searchParams.set("page", page.toString());
    } else {
      url.searchParams.delete("page");
    }

    if (role && role !== "all") {
      url.searchParams.set("role", role);
    } else {
      url.searchParams.delete("role");
    }

    window.history.replaceState({}, "", url);
  }

  let searchTimer: ReturnType<typeof setTimeout>;
  function handleSearch(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    searchTerm = value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      userStore.setSearch(value);
      updateUrl(value, 1, selectedRole);
    }, 500);
  }

  function handleRoleChange(value: string | undefined) {
    selectedRole = value || "all";
    updateUrl(searchTerm, 1, selectedRole);
    userStore.setSearch(searchTerm);
  }

  function handlePageChange(page: number) {
    currentPage = page;
    userStore.setPage(page);
    updateUrl(searchTerm, page, selectedRole);
  }

  function getRoleBadgeVariant(roles: string[]): "default" | "secondary" | "destructive" | "outline" {
    if (roles.includes("admin")) return "destructive";
    if (roles.includes("merchant")) return "default";
    if (roles.includes("driver")) return "secondary";
    return "outline";
  }

  function getPrimaryRole(roles: string[]): string {
    if (roles.includes("admin")) return "Admin";
    if (roles.includes("merchant")) return "Merchant";
    if (roles.includes("driver")) return "Driver";
    if (roles.includes("customer")) return "Customer";
    return roles[0] || "Unknown";
  }
</script>

<Card.Root>
  <Card.Header class="flex flex-row items-center justify-between px-7">
    <div>
      <Card.Title>User Management</Card.Title>
      <Card.Description>Manage users and view their details.</Card.Description>
    </div>
  </Card.Header>
  <Card.Content>
    <div
      class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
    >
      <Tabs
        value={selectedRole}
        onValueChange={handleRoleChange}
        class="w-full md:w-auto"
      >
        <TabsList>
          <TabsTrigger value="all">
            All
          </TabsTrigger>
          <TabsTrigger value="admin">
            Admin
          </TabsTrigger>
          <TabsTrigger value="merchant">
            Merchant
          </TabsTrigger>
          <TabsTrigger value="driver">
            Driver
          </TabsTrigger>
          <TabsTrigger value="customer">
            Customer
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div class="relative flex-1 md:max-w-sm">
        <Search
          class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
        />
        <Input
          type="search"
          placeholder="Search users..."
          class="pl-8"
          value={searchTerm}
          oninput={handleSearch}
        />
      </div>
    </div>

    {#if userStore.isLoading && userStore.users.length === 0}
      <div class="flex h-[400px] items-center justify-center">
        <RefreshCw class="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    {:else if userStore.error}
      <div class="flex h-[400px] flex-col items-center justify-center gap-4">
        <p class="text-destructive">{userStore.error}</p>
        <Button onclick={() => userStore.fetchUsers()}>Coba Lagi</Button>
      </div>
    {:else}
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head>User</Table.Head>
            <Table.Head>Email</Table.Head>
            <Table.Head>Roles</Table.Head>
            <Table.Head class="text-right">Actions</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#if userStore.users.length === 0}
            <Table.Row>
              <Table.Cell colspan={4} class="h-24 text-center">
                No users found
              </Table.Cell>
            </Table.Row>
          {:else}
            {#each userStore.users as user}
              <Table.Row>
                <Table.Cell>
                  <a
                    href="/console/users/{user.id}"
                    class="flex items-center gap-3 hover:underline"
                  >
                    <Avatar.Root class="h-9 w-9">
                      <Avatar.Fallback>
                        <User class="h-4 w-4" />
                      </Avatar.Fallback>
                    </Avatar.Root>
                    <div class="grid gap-0.5">
                      <div class="font-medium">{user.username}</div>
                      <div class="text-xs text-muted-foreground">
                        ID: {user.id}
                      </div>
                    </div>
                  </a>
                </Table.Cell>
                <Table.Cell>{user.email || "-"}</Table.Cell>
                <Table.Cell>
                  <Badge variant={getRoleBadgeVariant(user.roles)}>
                    {getPrimaryRole(user.roles)}
                  </Badge>
                </Table.Cell>
                <Table.Cell class="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    as="a"
                    href="/console/users/{user.id}"
                  >
                    <MoreHorizontal class="h-4 w-4" />
                    <span class="sr-only">View Details</span>
                  </Button>
                </Table.Cell>
              </Table.Row>
            {/each}
          {/if}
        </Table.Body>
      </Table.Root>

      <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-muted-foreground">
          Showing {(userStore.currentPage - 1) *
            userStore.itemsPerPage +
            1} to {Math.min(
            userStore.currentPage * userStore.itemsPerPage,
            userStore.totalItems,
          )} of {userStore.totalItems} entries
        </div>
        <div class="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onclick={() => handlePageChange(userStore.currentPage - 1)}
            disabled={userStore.currentPage === 1 ||
              userStore.isLoading}
          >
            Previous
          </Button>
          <div class="flex items-center gap-1">
            {#each Array.from( { length: Math.min(5, userStore.totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(userStore.currentPage - 2, userStore.totalPages - 4));
                return Math.max(1, start + i);
              }, ).filter((v, i, a) => a.indexOf(v) === i && v <= userStore.totalPages) as page}
              <Button
                variant={userStore.currentPage === page
                  ? "default"
                  : "outline"}
                size="sm"
                class="h-8 w-8 p-0"
                onclick={() => handlePageChange(page)}
                disabled={userStore.isLoading}
              >
                {page}
              </Button>
            {/each}
          </div>
          <Button
            variant="outline"
            size="sm"
            onclick={() => handlePageChange(userStore.currentPage + 1)}
            disabled={userStore.currentPage === userStore.totalPages ||
              userStore.isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    {/if}
  </Card.Content>
</Card.Root>
