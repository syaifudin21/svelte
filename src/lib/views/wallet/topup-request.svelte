<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import * as Table from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";
  import { Tabs, TabsList, TabsTrigger } from "$lib/components/ui/tabs";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import * as Dialog from "$lib/components/ui/dialog";
  import { Label } from "$lib/components/ui/label";
  import { Textarea } from "$lib/components/ui/textarea";
  import { walletStore } from "$lib/stores/wallet.svelte";
  import type { WalletRequestStatus } from "$lib/types/wallet";
  import { uiStore } from "$lib/stores/ui.svelte";
  import {
    Search,
    MoreHorizontal,
    Check,
    X,
    Loader2,
    RefreshCw,
  } from "lucide-svelte";
  import { onMount } from "svelte";

  let searchTerm = $state("");
  let currentPage = $state(1);

  // Dialog state
  let isDialogOpen = $state(false);
  let selectedRequestId = $state<number | null>(null);
  let actionType = $state<"approved" | "rejected">("approved");
  let adminNote = $state("");

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    searchTerm = params.get("search") || "";
    currentPage = parseInt(params.get("page") || "1");

    walletStore.fetchRequests(undefined, searchTerm, currentPage);
    uiStore.setBreadcrumbs([
      { label: uiStore.t("sidebar.dashboard"), href: "/dashboard" },
      { label: uiStore.t("wallet.title") || "Wallet" },
      { label: uiStore.t("wallet.topup_request") || "Topup Request" },
    ]);
  });

  function handleStatusChange(value: string | undefined) {
    walletStore.setStatus(value as WalletRequestStatus);
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
      walletStore.setSearch(value);
      updateUrl(value, 1);
    }, 500);
  }

  function handlePageChange(page: number) {
    currentPage = page;
    walletStore.setPage(page);
    updateUrl(searchTerm, page);
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  function openActionDialog(id: number, type: "approved" | "rejected") {
    selectedRequestId = id;
    actionType = type;
    adminNote = "";
    isDialogOpen = true;
  }

  async function submitAction() {
    if (!selectedRequestId) return;
    const success = await walletStore.updateRequestStatus(
      selectedRequestId,
      actionType,
      adminNote,
    );
    if (success) {
      isDialogOpen = false;
      selectedRequestId = null;
    }
  }
</script>

<Card.Root>
  <Card.Header class="flex flex-row items-center justify-between px-7">
    <div>
      <Card.Title
        >{uiStore.t("wallet.topup_management") ||
          "Topup Request Management"}</Card.Title
      >
      <Card.Description
        >{uiStore.t("wallet.topup_desc") ||
          "Manage and review wallet topup requests."}</Card.Description
      >
    </div>
  </Card.Header>
  <Card.Content>
    <div
      class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
    >
      <Tabs
        value={walletStore.status || "all"}
        onValueChange={handleStatusChange}
        class="w-full md:w-auto"
      >
        <TabsList>
          <TabsTrigger value="all">
            {uiStore.t("wallet.all") || "All"}
            {#if walletStore.summary?.total}
              <span class="ml-1 text-xs text-muted-foreground"
                >({walletStore.summary.total})</span
              >
            {/if}
          </TabsTrigger>
          <TabsTrigger value="pending">
            {uiStore.t("wallet.pending") || "Pending"}
            {#if walletStore.summary?.pending}
              <span class="ml-1 text-xs text-muted-foreground"
                >({walletStore.summary.pending})</span
              >
            {/if}
          </TabsTrigger>
          <TabsTrigger value="approved">
            {uiStore.t("wallet.approved") || "Approved"}
            {#if walletStore.summary?.approved}
              <span class="ml-1 text-xs text-muted-foreground"
                >({walletStore.summary.approved})</span
              >
            {/if}
          </TabsTrigger>
          <TabsTrigger value="rejected">
            {uiStore.t("wallet.rejected") || "Rejected"}
            {#if walletStore.summary?.rejected}
              <span class="ml-1 text-xs text-muted-foreground"
                >({walletStore.summary.rejected})</span
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
          placeholder={uiStore.t("wallet.search_placeholder") ||
            "Search requests..."}
          class="pl-8"
          value={searchTerm}
          oninput={handleSearch}
        />
      </div>
    </div>

    {#if walletStore.isLoading && walletStore.requests.length === 0}
      <div class="flex h-[400px] items-center justify-center">
        <RefreshCw class="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    {:else if walletStore.error}
      <div class="flex h-[400px] flex-col items-center justify-center gap-4">
        <p class="text-destructive">{walletStore.error}</p>
        <Button onclick={() => walletStore.fetchRequests()}>Coba Lagi</Button>
      </div>
    {:else}
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head>{uiStore.t("wallet.request_id") || "ID"}</Table.Head>
            <Table.Head>{uiStore.t("wallet.user") || "User ID"}</Table.Head>
            <Table.Head>{uiStore.t("wallet.amount") || "Amount"}</Table.Head>
            <Table.Head
              >{uiStore.t("wallet.requested_at") || "Requested At"}</Table.Head
            >
            <Table.Head>{uiStore.t("dashboard.status")}</Table.Head>
            <Table.Head class="text-right"
              >{uiStore.t("wallet.actions") || "Actions"}</Table.Head
            >
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#if walletStore.requests.length === 0}
            <Table.Row>
              <Table.Cell colspan={6} class="h-24 text-center">
                {uiStore.t("wallet.no_data") || "No data available"}
              </Table.Cell>
            </Table.Row>
          {:else}
            {#each walletStore.requests as request}
              <Table.Row>
                <Table.Cell class="font-medium">#{request.id}</Table.Cell>
                <Table.Cell>User #{request.user_id}</Table.Cell>
                <Table.Cell>{formatCurrency(request.amount)}</Table.Cell>
                <Table.Cell>{formatDate(request.requested_at)}</Table.Cell>
                <Table.Cell>
                  <Badge
                    variant={request.status === "approved"
                      ? "default"
                      : request.status === "rejected"
                        ? "destructive"
                        : "secondary"}
                  >
                    {uiStore.t(`wallet.status_${request.status}`) ||
                      request.status}
                  </Badge>
                </Table.Cell>
                <Table.Cell class="text-right">
                  {#if request.status === "pending"}
                    <div class="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        class="h-8 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                        onclick={() => openActionDialog(request.id, "approved")}
                      >
                        <Check class="mr-1 h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        class="h-8 border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onclick={() => openActionDialog(request.id, "rejected")}
                      >
                        <X class="mr-1 h-3.5 w-3.5" />
                        Reject
                      </Button>
                    </div>
                  {:else}
                    <Button variant="ghost" size="icon" disabled>
                      <Check class="h-4 w-4" />
                    </Button>
                  {/if}
                </Table.Cell>
              </Table.Row>
            {/each}
          {/if}
        </Table.Body>
      </Table.Root>

      <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-muted-foreground">
          Showing {(walletStore.currentPage - 1) * walletStore.itemsPerPage + 1}
          to {Math.min(
            walletStore.currentPage * walletStore.itemsPerPage,
            walletStore.totalItems,
          )} of {walletStore.totalItems} entries
        </div>
        <div class="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onclick={() => handlePageChange(walletStore.currentPage - 1)}
            disabled={walletStore.currentPage === 1 || walletStore.isLoading}
          >
            Previous
          </Button>
          <div class="flex items-center gap-1">
            {#each Array.from( { length: Math.min(5, walletStore.totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(walletStore.currentPage - 2, walletStore.totalPages - 4));
                return Math.max(1, start + i);
              }, ).filter((v, i, a) => a.indexOf(v) === i && v <= walletStore.totalPages) as page}
              <Button
                variant={walletStore.currentPage === page
                  ? "default"
                  : "outline"}
                size="sm"
                class="h-8 w-8 p-0"
                onclick={() => handlePageChange(page)}
                disabled={walletStore.isLoading}
              >
                {page}
              </Button>
            {/each}
          </div>
          <Button
            variant="outline"
            size="sm"
            onclick={() => handlePageChange(walletStore.currentPage + 1)}
            disabled={walletStore.currentPage === walletStore.totalPages ||
              walletStore.isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    {/if}
  </Card.Content>
</Card.Root>

<Dialog.Root bind:open={isDialogOpen}>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>
        {actionType === "approved"
          ? "Approve Topup Request"
          : "Reject Topup Request"}
      </Dialog.Title>
      <Dialog.Description>
        {actionType === "approved"
          ? "Are you sure you want to approve this topup request?"
          : "Please provide a reason for rejecting this topup request."}
      </Dialog.Description>
    </Dialog.Header>
    <div class="grid gap-4 py-4">
      <div class="grid gap-2">
        <Label for="admin_note">Admin Note (Optional)</Label>
        <Textarea
          id="admin_note"
          placeholder="Enter note here..."
          bind:value={adminNote}
        />
      </div>
    </div>
    <Dialog.Footer>
      <Button variant="outline" onclick={() => (isDialogOpen = false)}
        >Cancel</Button
      >
      <Button
        variant={actionType === "approved" ? "default" : "destructive"}
        onclick={submitAction}
        disabled={walletStore.isLoading}
      >
        {#if walletStore.isLoading}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
        {/if}
        {actionType === "approved" ? "Approve" : "Reject"}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
