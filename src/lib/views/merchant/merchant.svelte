<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import * as Table from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";
  import * as Avatar from "$lib/components/ui/avatar";
  import { Tabs, TabsList, TabsTrigger } from "$lib/components/ui/tabs";
  import { merchantStore } from "$lib/stores/merchant.svelte";
  import type { MerchantStatus } from "$lib/types/merchant";
  import { uiStore } from "$lib/stores/ui.svelte";
  import { Search, MoreHorizontal, Store, RefreshCw } from "lucide-svelte";
  import { onMount } from "svelte";

  let searchTerm = $state("");
  let currentPage = $state(1);

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    searchTerm = params.get("search") || "";
    currentPage = parseInt(params.get("page") || "1");

    merchantStore.fetchMerchants(undefined, searchTerm, currentPage);
    uiStore.setBreadcrumbs([
      { label: uiStore.t("sidebar.dashboard"), href: "/dashboard" },
      { label: "Merchant Management" },
    ]);
  });

  function handleStatusChange(value: string | undefined) {
    merchantStore.setStatus(value as MerchantStatus);
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
      merchantStore.setSearch(value);
      updateUrl(value, 1);
    }, 500);
  }

  function handlePageChange(page: number) {
    currentPage = page;
    merchantStore.setPage(page);
    updateUrl(searchTerm, page);
  }
</script>

<Card.Root>
  <Card.Header class="flex flex-row items-center justify-between px-7">
    <div>
      <Card.Title>Merchant Management</Card.Title>
      <Card.Description
        >Manage your merchants and their status.</Card.Description
      >
    </div>
  </Card.Header>
  <Card.Content>
    <div
      class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
    >
      <Tabs
        value={merchantStore.status || "all"}
        onValueChange={handleStatusChange}
        class="w-full md:w-auto"
      >
        <TabsList>
          <TabsTrigger value="all">
            All
            {#if merchantStore.summary?.total}
              <span class="ml-1 text-xs text-muted-foreground"
                >({merchantStore.summary.total})</span
              >
            {/if}
          </TabsTrigger>
          <TabsTrigger value="submitted">
            Submitted
            {#if merchantStore.summary?.submitted}
              <span class="ml-1 text-xs text-muted-foreground"
                >({merchantStore.summary.submitted})</span
              >
            {/if}
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved
            {#if merchantStore.summary?.approve}
              <span class="ml-1 text-xs text-muted-foreground"
                >({merchantStore.summary.approve})</span
              >
            {/if}
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            {#if merchantStore.summary?.pending}
              <span class="ml-1 text-xs text-muted-foreground"
                >({merchantStore.summary.pending})</span
              >
            {/if}
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected
            {#if merchantStore.summary?.rejected}
              <span class="ml-1 text-xs text-muted-foreground"
                >({merchantStore.summary.rejected})</span
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
          placeholder="Search merchants..."
          class="pl-8"
          value={searchTerm}
          oninput={handleSearch}
        />
      </div>
    </div>

    {#if merchantStore.isLoading && merchantStore.merchants.length === 0}
      <div class="flex h-[400px] items-center justify-center">
        <RefreshCw class="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    {:else if merchantStore.error}
      <div class="flex h-[400px] flex-col items-center justify-center gap-4">
        <p class="text-destructive">{merchantStore.error}</p>
        <Button onclick={() => merchantStore.fetchMerchants()}>Coba Lagi</Button
        >
      </div>
    {:else}
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head>Merchant</Table.Head>
            <Table.Head>Email</Table.Head>
            <Table.Head>Rating</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head class="text-right">Actions</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#if merchantStore.merchants.length === 0}
            <Table.Row>
              <Table.Cell colspan={5} class="h-24 text-center">
                No merchants found
              </Table.Cell>
            </Table.Row>
          {:else}
            {#each merchantStore.merchants as merchant}
              <Table.Row>
                <Table.Cell>
                  <a
                    href="/console/merchant/{merchant.uuid}"
                    class="flex items-center gap-3 hover:underline"
                  >
                    <Avatar.Root class="h-9 w-9">
                      <Avatar.Fallback>
                        <Store class="h-4 w-4" />
                      </Avatar.Fallback>
                    </Avatar.Root>
                    <div class="grid gap-0.5">
                      <div class="font-medium">{merchant.store_name}</div>
                      <div class="text-xs text-muted-foreground">
                        {merchant.category_name || "-"}
                      </div>
                    </div>
                  </a>
                </Table.Cell>
                <Table.Cell>{merchant.email || "-"}</Table.Cell>
                <Table.Cell
                  >{merchant.avg_rating
                    ? merchant.avg_rating.toFixed(1)
                    : "-"}</Table.Cell
                >
                <Table.Cell>
                  <Badge
                    variant={merchant.status === "approved"
                      ? "default"
                      : merchant.status === "rejected"
                        ? "destructive"
                        : "secondary"}
                  >
                    {merchant.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell class="text-right">
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal class="h-4 w-4" />
                    <span class="sr-only">Actions</span>
                  </Button>
                </Table.Cell>
              </Table.Row>
            {/each}
          {/if}
        </Table.Body>
      </Table.Root>

      <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-muted-foreground">
          Showing {(merchantStore.currentPage - 1) *
            merchantStore.itemsPerPage +
            1} to {Math.min(
            merchantStore.currentPage * merchantStore.itemsPerPage,
            merchantStore.totalItems,
          )} of {merchantStore.totalItems} entries
        </div>
        <div class="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onclick={() => handlePageChange(merchantStore.currentPage - 1)}
            disabled={merchantStore.currentPage === 1 ||
              merchantStore.isLoading}
          >
            Previous
          </Button>
          <div class="flex items-center gap-1">
            {#each Array.from( { length: Math.min(5, merchantStore.totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(merchantStore.currentPage - 2, merchantStore.totalPages - 4));
                return Math.max(1, start + i);
              }, ).filter((v, i, a) => a.indexOf(v) === i && v <= merchantStore.totalPages) as page}
              <Button
                variant={merchantStore.currentPage === page
                  ? "default"
                  : "outline"}
                size="sm"
                class="h-8 w-8 p-0"
                onclick={() => handlePageChange(page)}
                disabled={merchantStore.isLoading}
              >
                {page}
              </Button>
            {/each}
          </div>
          <Button
            variant="outline"
            size="sm"
            onclick={() => handlePageChange(merchantStore.currentPage + 1)}
            disabled={merchantStore.currentPage === merchantStore.totalPages ||
              merchantStore.isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    {/if}
  </Card.Content>
</Card.Root>
