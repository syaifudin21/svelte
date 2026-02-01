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

	onMount(() => {
		driverStore.fetchDrivers();
		uiStore.setBreadcrumbs([
			{ label: uiStore.t("sidebar.dashboard"), href: "/dashboard" },
			{ label: uiStore.t("driver.title") }
		]);
	});

	function handleStatusChange(value: string | undefined) {
		driverStore.setStatus(value as DriverStatus);
	}

    let searchTimer: ReturnType<typeof setTimeout>;
    function handleSearch(e: Event) {
        const value = (e.target as HTMLInputElement).value;
        clearTimeout(searchTimer);
        searchTimer = setTimeout(() => {
            driverStore.setSearch(value);
        }, 500);
    }

</script>

<div class="flex items-center justify-between">
	<h2 class="text-3xl font-bold tracking-tight">{uiStore.t("driver.title")}</h2>
</div>

<Card.Root>
	<Card.Header>
		<Card.Title>{uiStore.t("driver.management")}</Card.Title>
		<Card.Description>{uiStore.t("driver.desc")}</Card.Description>
	</Card.Header>
	<Card.Content>
		<div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<Tabs value={driverStore.status || "all"} onValueChange={handleStatusChange} class="w-full md:w-auto">
				<TabsList>
					<TabsTrigger value="all">{uiStore.t("driver.all")}</TabsTrigger>
					<TabsTrigger value="submitted">{uiStore.t("driver.submitted")}</TabsTrigger>
					<TabsTrigger value="approved">{uiStore.t("driver.approved")}</TabsTrigger>
					<TabsTrigger value="rejected">{uiStore.t("driver.rejected")}</TabsTrigger>
				</TabsList>
			</Tabs>

			<div class="relative flex-1 md:max-w-sm">
				<Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
				<Input
					type="search"
					placeholder={uiStore.t("driver.search_placeholder")}
					class="pl-8"
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
	</Card.Content>
</Card.Root>
