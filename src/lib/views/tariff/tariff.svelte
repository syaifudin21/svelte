<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import * as Table from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";
  import * as Select from "$lib/components/ui/select";
  import TariffDialog from "$lib/components/tariff-dialog.svelte";
  import TariffIncentiveDialog from "$lib/components/tariff-incentive-dialog.svelte";
  import { tariffStore } from "$lib/stores/tariff.svelte";
  import { tariffService } from "$lib/services/tariff.service";
  import {
    serviceService,
    regencyService,
  } from "$lib/services/service.service";
  import type { Service, Regency } from "$lib/types/service";
  import type { Tariff } from "$lib/types/tariff";
  import { onMount } from "svelte";
  import { goto, replaceState } from "$app/navigation";
  import { RefreshCw, Filter, Pencil, Zap } from "lucide-svelte";

  let services = $state<Service[]>([]);
  let regencies = $state<Regency[]>([]);
  let selectedServiceId = $state<string>("");
  let selectedRegencyIds = $state<string[]>([]);
  let dialogOpen = $state(false);
  let selectedTariff = $state<Tariff | null>(null);

  function updateUrl(page: number) {
    const url = new URL(window.location.href);
    if (page > 1) {
      url.searchParams.set("page", page.toString());
    } else {
      url.searchParams.delete("page");
    }
    replaceState(url.pathname + url.search, {});
  }

  function handlePageChange(page: number) {
    tariffStore.setPage(page);
    updateUrl(page);
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  async function loadFilters() {
    try {
      const [servicesRes, regenciesRes] = await Promise.all([
        serviceService.getServices(),
        regencyService.getRegencies(),
      ]);
      services = servicesRes.data;
      regencies = regenciesRes.data;
    } catch (err) {
      console.error("Failed to load filters", err);
    }
  }

  function addRegency(regencyId: string) {
    if (regencyId && !selectedRegencyIds.includes(regencyId)) {
      selectedRegencyIds = [...selectedRegencyIds, regencyId];
      tariffStore.setRegencyIds(selectedRegencyIds);
    }
  }

  function removeRegency(regencyId: string) {
    selectedRegencyIds = selectedRegencyIds.filter((id) => id !== regencyId);
    tariffStore.setRegencyIds(selectedRegencyIds);
  }

  function handleServiceChange(value: string) {
    selectedServiceId = value;
    const serviceId = value ? parseInt(value) : undefined;
    tariffStore.setServiceId(serviceId);
    updateUrl(1); // Reset to page 1 on filter change
  }

  onMount(() => {
    const params = new URLSearchParams(window.location.search);
    const page = parseInt(params.get("page") || "1");

    loadFilters();
    tariffStore.setPage(page);
  });
</script>

<Card.Root>
  <Card.Header class="flex flex-row items-center justify-between px-7">
    <div>
      <Card.Title>Daftar Tarif</Card.Title>
      <Card.Description
        >Konfigurasi biaya per kilometer dan komisi.</Card.Description
      >
    </div>
    <Button size="sm" onclick={() => goto("/tariff/change")}>
      <Pencil class="mr-2 h-4 w-4" />
      Ubah Tarif
    </Button>
  </Card.Header>
  <Card.Content>
    <!-- Filters -->
    <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-center">
      <div class="flex items-center gap-2">
        <Filter class="h-4 w-4 text-muted-foreground" />
        <span class="text-sm font-medium">Filter:</span>
      </div>

      <Select.Root
        type="single"
        value={selectedServiceId}
        onValueChange={handleServiceChange}
      >
        <Select.Trigger class="w-[200px]">
          <span data-slot="select-value">
            {#if selectedServiceId}
              {services.find((s) => s.id.toString() === selectedServiceId)
                ?.name || "Pilih Service"}
            {:else}
              Pilih Service
            {/if}
          </span>
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="">Semua Service</Select.Item>
          {#each services as service}
            <Select.Item value={service.id.toString()}
              >{service.name}</Select.Item
            >
          {/each}
        </Select.Content>
      </Select.Root>

      <Select.Root
        type="single"
        onValueChange={(value) => {
          if (value) {
            addRegency(value);
            updateUrl(1); // Reset to page 1 on filter change
          }
        }}
      >
        <Select.Trigger class="w-[200px]">
          <span data-slot="select-value"> Pilih Regency </span>
        </Select.Trigger>
        <Select.Content>
          {#each regencies as regency}
            <Select.Item
              value={regency.id}
              disabled={selectedRegencyIds.includes(regency.id)}
            >
              {regency.name}
            </Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>

      {#if selectedRegencyIds.length > 0}
        <div class="flex flex-wrap gap-2">
          {#each selectedRegencyIds as regencyId}
            {@const regency = regencies.find((r) => r.id === regencyId)}
            {#if regency}
              <Badge variant="secondary" class="gap-1">
                {regency.name}
                <button
                  onclick={() => removeRegency(regencyId)}
                  class="ml-1 rounded-full hover:bg-muted"
                >
                  ×
                </button>
              </Badge>
            {/if}
          {/each}
        </div>
      {/if}
    </div>

    {#if tariffStore.isLoading && tariffStore.tariffs.length === 0}
      <div class="flex h-[400px] items-center justify-center">
        <RefreshCw class="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    {:else if tariffStore.error}
      <div class="flex h-[400px] flex-col items-center justify-center gap-4">
        <p class="text-destructive">{tariffStore.error}</p>
        <Button onclick={() => tariffStore.fetchTariffs()}>Coba Lagi</Button>
      </div>
    {:else}
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head>Service</Table.Head>
            <Table.Head>Regency</Table.Head>
            <Table.Head>First KM Price</Table.Head>
            <Table.Head>Next KM Price</Table.Head>
            <Table.Head>Commission</Table.Head>
            <Table.Head>Max Distance</Table.Head>
            <Table.Head>Driver Radius</Table.Head>
            <Table.Head>Incentive</Table.Head>
            <Table.Head class="text-right">Actions</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each tariffStore.tariffs as tariff}
            <Table.Row>
              <Table.Cell>
                <div class="font-medium">
                  {#if services.length > 0}
                    {@const service = services.find(
                      (s) => s.id === tariff.service_id,
                    )}
                    {service?.name || `Service #${tariff.service_id}`}
                  {:else}
                    Service #{tariff.service_id}
                  {/if}
                </div>
              </Table.Cell>
              <Table.Cell>
                {#if tariff.regency}
                  <div class="font-medium">{tariff.regency.name}</div>
                  <div class="text-xs text-muted-foreground">
                    {tariff.regency.province.name}
                  </div>
                {:else}
                  <span class="text-muted-foreground">-</span>
                {/if}
              </Table.Cell>
              <Table.Cell
                >{formatCurrency(tariff.first_km_price)}
                <span class="text-xs text-muted-foreground"
                  >({tariff.first_km} km)</span
                ></Table.Cell
              >
              <Table.Cell>{formatCurrency(tariff.next_km_price)}/km</Table.Cell>
              <Table.Cell>
                <Badge variant="secondary">{tariff.commission_percent}%</Badge>
              </Table.Cell>
              <Table.Cell>{tariff.max_distance_km} km</Table.Cell>
              <Table.Cell>{tariff.driver_radius_km} km</Table.Cell>
              <Table.Cell>
                {#if tariff.has_incentive}
                  <div class="flex flex-col">
                    <span class="font-bold text-yellow-600">
                      {formatCurrency(tariff.incentive_fee)}
                    </span>
                    {#if tariff.incentive_expires_at}
                      <span class="text-[10px] text-muted-foreground">
                        Exp: {new Date(
                          tariff.incentive_expires_at,
                        ).toLocaleString("id-ID")}
                      </span>
                    {/if}
                  </div>
                {:else}
                  <span class="text-muted-foreground">-</span>
                {/if}
              </Table.Cell>
              <Table.Cell class="text-right">
                <TariffIncentiveDialog
                  {tariff}
                  onSuccess={() => tariffStore.fetchTariffs()}
                />
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>

      <!-- Pagination -->
      <div class="mt-4 flex items-center justify-between">
        <div class="text-sm text-muted-foreground">
          Showing {(tariffStore.currentPage - 1) * tariffStore.itemsPerPage + 1}
          to {Math.min(
            tariffStore.currentPage * tariffStore.itemsPerPage,
            tariffStore.totalItems,
          )} of {tariffStore.totalItems} entries
        </div>
        <div class="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onclick={() => handlePageChange(tariffStore.currentPage - 1)}
            disabled={tariffStore.currentPage === 1 || tariffStore.isLoading}
          >
            Previous
          </Button>
          <div class="flex items-center gap-1">
            {#each Array.from( { length: Math.min(5, tariffStore.totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(tariffStore.currentPage - 2, tariffStore.totalPages - 4));
                return Math.max(1, start + i);
              }, ).filter((v, i, a) => a.indexOf(v) === i && v <= tariffStore.totalPages) as page}
              <Button
                variant={tariffStore.currentPage === page
                  ? "default"
                  : "outline"}
                size="sm"
                class="h-8 w-8 p-0"
                onclick={() => handlePageChange(page)}
                disabled={tariffStore.isLoading}
              >
                {page}
              </Button>
            {/each}
          </div>
          <Button
            variant="outline"
            size="sm"
            onclick={() => handlePageChange(tariffStore.currentPage + 1)}
            disabled={tariffStore.currentPage === tariffStore.totalPages ||
              tariffStore.isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    {/if}
  </Card.Content>
</Card.Root>
