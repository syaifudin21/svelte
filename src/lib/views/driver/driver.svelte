<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import * as Table from "$lib/components/ui/table";
	import { Badge } from "$lib/components/ui/badge";
	import * as Avatar from "$lib/components/ui/avatar";
	import { Tabs, TabsList, TabsTrigger } from "$lib/components/ui/tabs";
	import { driverStore } from "$lib/stores/driver.svelte";
	import type { DriverStatus } from "$lib/types/driver";
	import { uiStore } from "$lib/stores/ui.svelte";
	import { 
		Search,
		MoreHorizontal
	} from "lucide-svelte";
	import { onMount } from "svelte";

    let searchTerm = $state("");
    let currentPage = $state(1);

	onMount(() => {
        const params = new URLSearchParams(window.location.search);
        searchTerm = params.get("search") || "";
        currentPage = parseInt(params.get("page") || "1");
        
		driverStore.fetchDrivers(undefined, searchTerm, currentPage);
		uiStore.setBreadcrumbs([
			{ label: uiStore.t("sidebar.dashboard"), href: "/dashboard" },
			{ label: uiStore.t("driver.title") }
		]);
	});

	function handleStatusChange(value: string | undefined) {
		driverStore.setStatus(value as DriverStatus);
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
        window.history.replaceState({}, '', url);
    }

    let searchTimer: ReturnType<typeof setTimeout>;
    function handleSearch(e: Event) {
        const value = (e.target as HTMLInputElement).value;
        searchTerm = value;
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            driverStore.setSearch(value);
            updateUrl(value, 1);
        }, 500);
    }

    function handlePageChange(page: number) {
        currentPage = page;
        driverStore.setPage(page);
        updateUrl(searchTerm, page);
    }

</script>

<Card.Root>
	<Card.Header>
		<Card.Title>{uiStore.t("driver.management")}</Card.Title>
		<Card.Description>{uiStore.t("driver.desc")}</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<Tabs value={driverStore.status || "all"} onValueChange={handleStatusChange} class="w-full md:w-auto">
				<TabsList>
					<TabsTrigger value="all">
                        {uiStore.t("driver.all")}
                        {#if driverStore.summary?.total}
                            <span class="ml-1 text-xs text-muted-foreground">({driverStore.summary.total})</span>
                        {/if}
                    </TabsTrigger>
					<TabsTrigger value="submitted">
                        {uiStore.t("driver.submitted")}
                        {#if driverStore.summary?.submitted}
                            <span class="ml-1 text-xs text-muted-foreground">({driverStore.summary.submitted})</span>
                        {/if}
                    </TabsTrigger>
					<TabsTrigger value="approved">
                        {uiStore.t("driver.approved")}
                        {#if driverStore.summary?.approve}
                            <span class="ml-1 text-xs text-muted-foreground">({driverStore.summary.approve})</span>
                        {/if}
                    </TabsTrigger>
                    <TabsTrigger value="pending">
                        {uiStore.t("driver.pending")}
                        {#if driverStore.summary?.pending}
                            <span class="ml-1 text-xs text-muted-foreground">({driverStore.summary.pending})</span>
                        {/if}
                    </TabsTrigger>
					<TabsTrigger value="rejected">
                        {uiStore.t("driver.rejected")}
                        {#if driverStore.summary?.rejected}
                            <span class="ml-1 text-xs text-muted-foreground">({driverStore.summary.rejected})</span>
                        {/if}
                    </TabsTrigger>
				</TabsList>
			</Tabs>

			<div class="relative flex-1 md:max-w-sm">
				<Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
				<Input
					type="search"
					placeholder={uiStore.t("driver.search_placeholder")}
					class="pl-8"
                    value={searchTerm}
                    oninput={handleSearch}
				/>
			</div>
		</div>

		<div class="rounded-md border">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>{uiStore.t("sidebar.driver")}</Table.Head>
						<Table.Head>{uiStore.t("driver.phone")}</Table.Head>
						<Table.Head>{uiStore.t("driver.plate")}</Table.Head>
						<Table.Head>{uiStore.t("dashboard.status")}</Table.Head>
						<Table.Head class="text-right">{uiStore.t("driver.actions")}</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#if driverStore.isLoading}
						<Table.Row>
							<Table.Cell colspan={5} class="h-24 text-center">
								{uiStore.t("driver.loading")}
							</Table.Cell>
						</Table.Row>
					{:else if driverStore.error}
						<Table.Row>
							<Table.Cell colspan={5} class="h-24 text-center text-destructive">
								{driverStore.error}
							</Table.Cell>
						</Table.Row>
					{:else if driverStore.drivers.length === 0}
						<Table.Row>
							<Table.Cell colspan={5} class="h-24 text-center">
								{uiStore.t("driver.no_data")}
							</Table.Cell>
						</Table.Row>
					{:else}
						{#each driverStore.drivers as driver}
							<Table.Row>
								<Table.Cell>
									<a href="/driver/{driver.uuid}" class="flex items-center gap-3 hover:underline">
										<Avatar.Root class="h-9 w-9">
											<Avatar.Fallback>{driver.full_name?.charAt(0) || 'D'}</Avatar.Fallback>
										</Avatar.Root>
										<div class="grid gap-0.5">
											<div class="font-medium">{driver.full_name}</div>
											<div class="text-xs text-muted-foreground">{driver.username}</div>
										</div>
									</a>
								</Table.Cell>
								<Table.Cell>{driver.phone_number}</Table.Cell>
								<Table.Cell>{driver.plate_number}</Table.Cell>
								<Table.Cell>
									<Badge 
										variant={
											driver.status === 'approved' ? 'default' : 
											driver.status === 'rejected' ? 'destructive' : 'secondary'
										}
									>
										{uiStore.t(`driver.${driver.status}`) || driver.status}
									</Badge>
								</Table.Cell>
								<Table.Cell class="text-right">
									<Button variant="ghost" size="icon">
										<MoreHorizontal class="h-4 w-4" />
										<span class="sr-only">{uiStore.t("driver.actions")}</span>
									</Button>
								</Table.Cell>
							</Table.Row>
						{/each}
					{/if}
				</Table.Body>
			</Table.Root>
		</div>

		<div class="mt-4 flex items-center justify-between">
            <div class="text-sm text-muted-foreground">
                Showing {(driverStore.currentPage - 1) * driverStore.itemsPerPage + 1} to {Math.min(driverStore.currentPage * driverStore.itemsPerPage, driverStore.totalItems)} of {driverStore.totalItems} entries
            </div>
            <div class="flex items-center space-x-2">
                <Button 
                    variant="outline" 
                    size="sm" 
                    onclick={() => handlePageChange(driverStore.currentPage - 1)}
                    disabled={driverStore.currentPage === 1 || driverStore.isLoading}
                >
                    Previous
                </Button>
                <div class="flex items-center gap-1">
                    {#each Array.from({ length: Math.min(5, driverStore.totalPages) }, (_, i) => {
                        const start = Math.max(1, Math.min(driverStore.currentPage - 2, driverStore.totalPages - 4));
                        return start + i;
                    }) as page}
                        <Button 
                            variant={driverStore.currentPage === page ? "default" : "outline"} 
                            size="sm"
                            class="h-8 w-8 p-0"
                            onclick={() => handlePageChange(page)}
                            disabled={driverStore.isLoading}
                        >
                            {page}
                        </Button>
                    {/each}
                </div>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onclick={() => handlePageChange(driverStore.currentPage + 1)}
                    disabled={driverStore.currentPage === driverStore.totalPages || driverStore.isLoading}
                >
                    Next
                </Button>
            </div>
        </div>
	</Card.Content>
</Card.Root>
