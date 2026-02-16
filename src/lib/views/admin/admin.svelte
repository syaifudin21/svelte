<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import * as Table from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";
  import * as Avatar from "$lib/components/ui/avatar";
  import { Tabs, TabsList, TabsTrigger } from "$lib/components/ui/tabs";
  import { adminStore } from "$lib/stores/admin.svelte";
  import type { AdminStatus } from "$lib/types/admin";
  import { uiStore } from "$lib/stores/ui.svelte";
  import { Search, MoreHorizontal, RefreshCw } from "lucide-svelte";
  import { onMount } from "svelte";

  let searchTerm = $state("");
  let currentPage = $state(1);

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    searchTerm = params.get("search") || "";
    currentPage = parseInt(params.get("page") || "1");

    adminStore.fetchAdmins(undefined, searchTerm, currentPage);
    uiStore.setBreadcrumbs([
      { label: uiStore.t("sidebar.dashboard"), href: "/dashboard" },
      { label: uiStore.t("sidebar.admin") || "Admin" },
    ]);
  });

  function handleStatusChange(value: string | undefined) {
    adminStore.setStatus(value as AdminStatus);
    updateUrl(searchTerm, 1);
  }

  function updateUrl(search: string, page: number) {
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
    window.history.replaceState({}, "", url);
  }

  let searchTimer: ReturnType<typeof setTimeout>;
  function handleSearch(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    searchTerm = value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      adminStore.setSearch(value);
      updateUrl(value, 1);
    }, 500);
  }

  function handlePageChange(page: number) {
    currentPage = page;
    adminStore.setPage(page);
    updateUrl(searchTerm, page);
  }
</script>

<Card.Root>
  <Card.Header class="flex flex-row items-center justify-between px-7">
    <div>
      <Card.Title
        >{uiStore.t("admin.management") || "Admin Management"}</Card.Title
      >
      <Card.Description
        >{uiStore.t("admin.desc") ||
          "Manage administrative users and their status."}</Card.Description
      >
    </div>
  </Card.Header>
  <Card.Content>
    <div
      class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
    >
      <Tabs
        value={adminStore.status || "all"}
        onValueChange={handleStatusChange}
        class="w-full md:w-auto"
      >
        <TabsList>
          <TabsTrigger value="all">
            {uiStore.t("admin.all") || "All"}
            {#if adminStore.summary?.total}
              <span class="ml-1 text-xs text-muted-foreground"
                >({adminStore.summary.total})</span
              >
            {/if}
          </TabsTrigger>
          <TabsTrigger value="submitted">
            {uiStore.t("admin.submitted") || "Submitted"}
            {#if adminStore.summary?.submitted}
              <span class="ml-1 text-xs text-muted-foreground"
                >({adminStore.summary.submitted})</span
              >
            {/if}
          </TabsTrigger>
          <TabsTrigger value="approved">
            {uiStore.t("admin.approved") || "Approved"}
            {#if adminStore.summary?.approve}
              <span class="ml-1 text-xs text-muted-foreground"
                >({adminStore.summary.approve})</span
              >
            {/if}
          </TabsTrigger>
          <TabsTrigger value="pending">
            {uiStore.t("admin.pending") || "Pending"}
            {#if adminStore.summary?.pending}
              <span class="ml-1 text-xs text-muted-foreground"
                >({adminStore.summary.pending})</span
              >
            {/if}
          </TabsTrigger>
          <TabsTrigger value="rejected">
            {uiStore.t("admin.rejected") || "Rejected"}
            {#if adminStore.summary?.rejected}
              <span class="ml-1 text-xs text-muted-foreground"
                >({adminStore.summary.rejected})</span
              >
            {/if}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div class="relative flex-1 md:max-w-sm">
        <Search
          class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
        />
        <Input
          type="search"
          placeholder={uiStore.t("admin.search_placeholder") ||
            "Search admin..."}
          class="pl-8"
          value={searchTerm}
          oninput={handleSearch}
        />
      </div>
    </div>

    {#if adminStore.isLoading && adminStore.admins.length === 0}
      <div class="flex h-[400px] items-center justify-center">
        <RefreshCw class="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    {:else if adminStore.error}
      <div class="flex h-[400px] flex-col items-center justify-center gap-4">
        <p class="text-destructive">{adminStore.error}</p>
        <Button onclick={() => adminStore.fetchAdmins()}>Coba Lagi</Button>
      </div>
    {:else}
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head>{uiStore.t("admin.name") || "Name"}</Table.Head>
            <Table.Head>{uiStore.t("admin.email") || "Email"}</Table.Head>
            <Table.Head>{uiStore.t("dashboard.status")}</Table.Head>
            <Table.Head class="text-right"
              >{uiStore.t("admin.actions") || "Actions"}</Table.Head
            >
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#if adminStore.admins.length === 0}
            <Table.Row>
              <Table.Cell colspan={4} class="h-24 text-center">
                {uiStore.t("admin.no_data") || "No data available"}
              </Table.Cell>
            </Table.Row>
          {:else}
            {#each adminStore.admins as admin}
              <Table.Row>
                <Table.Cell>
                  <div class="flex items-center gap-3">
                    <Avatar.Root class="h-9 w-9">
                      <Avatar.Fallback
                        >{admin.name?.charAt(0) || "A"}</Avatar.Fallback
                      >
                    </Avatar.Root>
                    <div class="grid gap-0.5">
                      <div class="font-medium">{admin.name}</div>
                      <div class="text-xs text-muted-foreground">
                        {admin.username}
                      </div>
                    </div>
                  </div>
                </Table.Cell>
                <Table.Cell>{admin.email || "-"}</Table.Cell>
                <Table.Cell>
                  <Badge
                    variant={admin.status === "approved"
                      ? "default"
                      : admin.status === "rejected"
                        ? "destructive"
                        : "secondary"}
                  >
                    {uiStore.t(`admin.status_${admin.status}`) || admin.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell class="text-right">
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal class="h-4 w-4" />
                    <span class="sr-only"
                      >{uiStore.t("admin.actions") || "Actions"}</span
                    >
                  </Button>
                </Table.Cell>
              </Table.Row>
            {/each}
          {/if}
        </Table.Body>
      </Table.Root>

      <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-muted-foreground">
          Showing {(adminStore.currentPage - 1) * adminStore.itemsPerPage + 1} to
          {Math.min(
            adminStore.currentPage * adminStore.itemsPerPage,
            adminStore.totalItems,
          )} of {adminStore.totalItems} entries
        </div>
        <div class="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onclick={() => handlePageChange(adminStore.currentPage - 1)}
            disabled={adminStore.currentPage === 1 || adminStore.isLoading}
          >
            Previous
          </Button>
          <div class="flex items-center gap-1">
            {#each Array.from( { length: Math.min(5, adminStore.totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(adminStore.currentPage - 2, adminStore.totalPages - 4));
                return Math.max(1, start + i);
              }, ).filter((v, i, a) => a.indexOf(v) === i && v <= adminStore.totalPages) as page}
              <Button
                variant={adminStore.currentPage === page
                  ? "default"
                  : "outline"}
                size="sm"
                class="h-8 w-8 p-0"
                onclick={() => handlePageChange(page)}
                disabled={adminStore.isLoading}
              >
                {page}
              </Button>
            {/each}
          </div>
          <Button
            variant="outline"
            size="sm"
            onclick={() => handlePageChange(adminStore.currentPage + 1)}
            disabled={adminStore.currentPage === adminStore.totalPages ||
              adminStore.isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    {/if}
  </Card.Content>
</Card.Root>
