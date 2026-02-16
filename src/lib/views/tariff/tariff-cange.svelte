<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Card from "$lib/components/ui/card";
  import * as Select from "$lib/components/ui/select";
  import * as Table from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";
  import { serviceService } from "$lib/services/service.service";
  import { regionService } from "$lib/services/region.service";
  import { tariffService } from "$lib/services/tariff.service";
  import type { Service } from "$lib/types/service";
  import type { Province, RegencyOption } from "$lib/types/region";
  import type {
    Tariff,
    TariffFormData,
    ServiceTariffData,
  } from "$lib/types/tariff";
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { ArrowLeft, Save } from "lucide-svelte";
  import { toast } from "svelte-sonner";

  let services = $state<Service[]>([]);
  let provinces = $state<Province[]>([]);
  let regencies = $state<RegencyOption[]>([]);
  let selectedProvinceId = $state<string>("");
  let selectedRegencyId = $state<string>("");
  let loadingRegencies = $state(false);
  let isSubmitting = $state(false);
  let loadingDefaults = $state(true);
  let loadingExistingTariffs = $state(false);

  // Filter states
  let provinceSearch = $state("");
  let regencySearch = $state("");

  // Filtered lists
  let filteredProvinces = $derived(
    provinces.filter((p) =>
      p.name.toLowerCase().includes(provinceSearch.toLowerCase()),
    ),
  );
  let filteredRegencies = $derived(
    regencies.filter((r) =>
      r.name.toLowerCase().includes(regencySearch.toLowerCase()),
    ),
  );

  // Tariff data per service
  let serviceTariffs = $state<ServiceTariffData[]>([]);
  let defaultTariffs = $state<Tariff[]>([]);

  async function loadData() {
    try {
      const [servicesRes, provincesRes, defaultTariffsRes] = await Promise.all([
        serviceService.getServices(),
        regionService.getProvinces(),
        tariffService.getDefaultTariffs(),
      ]);

      services = servicesRes.data;
      provinces = provincesRes.data;

      const defaultData = defaultTariffsRes.data;
      defaultTariffs = Array.isArray(defaultData)
        ? defaultData
        : defaultData.items;

      // Initialize service tariffs with default values
      initializeServiceTariffs();
    } catch (error) {
      console.error("Failed to load data", error);
      toast.error("Gagal memuat data", {
        description: "Terjadi kesalahan saat memuat data default tarif",
      });
    } finally {
      loadingDefaults = false;
    }
  }

  function initializeServiceTariffs(prioritizedTariffs: Tariff[] = []) {
    serviceTariffs = services.map((service) => {
      // Find tariff for this service from prioritized list
      const tariff = prioritizedTariffs.find(
        (t) => t.service_id === service.id,
      );

      // If tariff has regency field populated, it's existing; otherwise it's default
      const isExisting = !!(tariff && tariff.regency && tariff.regency.id);

      return {
        service_id: service.id,
        service_name: service.name,
        first_km: tariff?.first_km || 1,
        first_km_price: tariff?.first_km_price || 0,
        next_km_price: tariff?.next_km_price || 0,
        driver_radius_km: tariff?.driver_radius_km || 5,
        commission_percent: tariff?.commission_percent || 10,
        max_distance_km: tariff?.max_distance_km || 50,
        isExisting: isExisting,
      };
    });
  }

  async function loadPrioritizedTariffsForRegency(regencyId: string) {
    if (!regencyId) {
      // When no regency selected, load defaults
      try {
        const response = await tariffService.getDefaultTariffs();
        const data = response.data;
        const items = Array.isArray(data) ? data : data.items;
        initializeServiceTariffs(items);
      } catch (error) {
        console.error("Failed to load default tariffs", error);
      }
      return;
    }

    loadingExistingTariffs = true;
    try {
      const response = await tariffService.getPrioritizedTariffs(regencyId);
      const data = response.data;
      const items = Array.isArray(data) ? data : data.items;

      initializeServiceTariffs(items);

      // Count how many have regency (existing) vs don't have regency (default)
      const existingCount = items.filter(
        (t) => t.regency && t.regency.id,
      ).length;
      const defaultCount = items.length - existingCount;

      if (existingCount > 0 && defaultCount > 0) {
        toast.info("Data tarif dimuat", {
          description: `${existingCount} tarif existing, ${defaultCount} menggunakan default`,
        });
      } else if (existingCount === items.length) {
        toast.success("Semua tarif sudah ada", {
          description: `${existingCount} tarif existing untuk regency ini`,
        });
      } else {
        toast.info("Menggunakan tarif default", {
          description: `Semua ${defaultCount} tarif menggunakan nilai default`,
        });
      }
    } catch (error) {
      console.error("Failed to load prioritized tariffs", error);
      toast.error("Gagal memuat tarif", {
        description: "Terjadi kesalahan saat memuat data tarif",
      });
    } finally {
      loadingExistingTariffs = false;
    }
  }

  async function loadRegencies(provinceId: string) {
    if (!provinceId) {
      regencies = [];
      return;
    }

    loadingRegencies = true;
    try {
      const response = await regionService.getRegenciesByProvince(provinceId);
      regencies = response.data;
    } catch (error) {
      console.error("Failed to load regencies", error);
      regencies = [];
      toast.error("Gagal memuat regency", {
        description: "Terjadi kesalahan saat memuat daftar regency",
      });
    } finally {
      loadingRegencies = false;
    }
  }

  $effect(() => {
    if (selectedProvinceId) {
      loadRegencies(selectedProvinceId);
      selectedRegencyId = "";
      regencySearch = ""; // Reset regency search when province changes
    } else {
      regencies = [];
      selectedRegencyId = "";
      regencySearch = "";
    }
  });

  $effect(() => {
    if (selectedRegencyId && services.length > 0) {
      loadPrioritizedTariffsForRegency(selectedRegencyId);
    } else if (
      !selectedRegencyId &&
      services.length > 0 &&
      defaultTariffs.length > 0
    ) {
      // Reset to defaults when regency is cleared
      initializeServiceTariffs(defaultTariffs);
    }
  });

  async function handleSubmit(e: Event) {
    e.preventDefault();

    if (!selectedRegencyId) {
      toast.error("Regency belum dipilih", {
        description: "Silakan pilih regency terlebih dahulu",
      });
      return;
    }

    isSubmitting = true;
    let successCount = 0;
    let failedCount = 0;
    const failedServices: string[] = [];

    try {
      // Save tariff for each service one by one
      for (const serviceTariff of serviceTariffs) {
        const tariffData: TariffFormData = {
          service_id: serviceTariff.service_id,
          regency_id: selectedRegencyId,
          first_km: serviceTariff.first_km,
          first_km_price: serviceTariff.first_km_price,
          next_km_price: serviceTariff.next_km_price,
          driver_radius_km: serviceTariff.driver_radius_km,
          commission_percent: serviceTariff.commission_percent,
          max_distance_km: serviceTariff.max_distance_km,
        };

        try {
          await tariffService.saveTariff(tariffData);
          successCount++;
        } catch (error) {
          console.error(
            `Failed to save tariff for service ${serviceTariff.service_name}`,
            error,
          );
          failedCount++;
          failedServices.push(serviceTariff.service_name);
        }
      }

      if (failedCount === 0) {
        toast.success("Berhasil menyimpan semua tarif", {
          description: `${successCount} tarif berhasil disimpan`,
        });
        goto("/tariff");
      } else if (successCount > 0) {
        toast.warning("Sebagian tarif berhasil disimpan", {
          description: `${successCount} berhasil, ${failedCount} gagal: ${failedServices.join(", ")}`,
        });
        goto("/tariff");
      } else {
        toast.error("Gagal menyimpan tarif", {
          description: "Semua tarif gagal disimpan. Silakan coba lagi.",
        });
      }
    } finally {
      isSubmitting = false;
    }
  }

  onMount(() => {
    loadData();
  });
</script>

{#if loadingDefaults}
  <Card.Root>
    <Card.Content class="py-10 text-center">
      <p class="text-muted-foreground">Loading default tariffs...</p>
    </Card.Content>
  </Card.Root>
{:else}
  <form onsubmit={handleSubmit}>
    <Card.Root>
      <Card.Header>
        <Card.Title>Pilih Lokasi</Card.Title>
        <Card.Description>
          Pilih province dan regency untuk tarif yang akan dibuat
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label for="province">Province *</Label>
            <Select.Root
              type="single"
              bind:value={selectedProvinceId}
              onValueChange={() => (provinceSearch = "")}
            >
              <Select.Trigger id="province">
                <span data-slot="select-value">
                  {#if selectedProvinceId}
                    {provinces.find((p) => p.id === selectedProvinceId)?.name ||
                      "Pilih Province"}
                  {:else}
                    Pilih Province
                  {/if}
                </span>
              </Select.Trigger>
              <Select.Content>
                <div class="p-2">
                  <Input
                    placeholder="Cari province..."
                    bind:value={provinceSearch}
                    class="h-8"
                    onkeydown={(e) => e.stopPropagation()}
                  />
                </div>
                {#each filteredProvinces as province}
                  <Select.Item value={province.id}>{province.name}</Select.Item>
                {/each}
                {#if filteredProvinces.length === 0}
                  <div
                    class="px-2 py-4 text-center text-sm text-muted-foreground"
                  >
                    Tidak ada hasil
                  </div>
                {/if}
              </Select.Content>
            </Select.Root>
          </div>

          <div class="space-y-2">
            <Label for="regency">Regency *</Label>
            <Select.Root
              type="single"
              bind:value={selectedRegencyId}
              disabled={!selectedProvinceId || loadingRegencies}
              onValueChange={() => (regencySearch = "")}
            >
              <Select.Trigger id="regency">
                <span data-slot="select-value">
                  {#if loadingRegencies}
                    Loading...
                  {:else if selectedRegencyId}
                    {regencies.find((r) => r.id === selectedRegencyId)?.name ||
                      "Pilih Regency"}
                  {:else if !selectedProvinceId}
                    Pilih Province terlebih dahulu
                  {:else}
                    Pilih Regency
                  {/if}
                </span>
              </Select.Trigger>
              <Select.Content>
                <div class="p-2">
                  <Input
                    placeholder="Cari regency..."
                    bind:value={regencySearch}
                    class="h-8"
                    onkeydown={(e) => e.stopPropagation()}
                  />
                </div>
                {#each filteredRegencies as regency}
                  <Select.Item value={regency.id}>{regency.name}</Select.Item>
                {/each}
                {#if filteredRegencies.length === 0}
                  <div
                    class="px-2 py-4 text-center text-sm text-muted-foreground"
                  >
                    Tidak ada hasil
                  </div>
                {/if}
              </Select.Content>
            </Select.Root>
          </div>
        </div>
      </Card.Content>
    </Card.Root>

    <Card.Root class="mt-6">
      <Card.Header>
        <Card.Title>Konfigurasi Tarif per Service</Card.Title>
        <Card.Description>
          Atur tarif untuk setiap service. Badge "Existing" menunjukkan tarif
          yang sudah ada, "Default" menunjukkan nilai default.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <div class="overflow-x-auto">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.Head class="w-[150px]">Service</Table.Head>
                <Table.Head>First KM</Table.Head>
                <Table.Head>First KM Price</Table.Head>
                <Table.Head>Next KM Price</Table.Head>
                <Table.Head>Driver Radius</Table.Head>
                <Table.Head>Commission %</Table.Head>
                <Table.Head>Max Distance</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {#each serviceTariffs as tariff, index}
                <Table.Row>
                  <Table.Cell class="font-medium">
                    <div class="flex items-center gap-2">
                      {tariff.service_name}
                      {#if tariff.isExisting}
                        <Badge variant="secondary" class="text-xs"
                          >Existing</Badge
                        >
                      {:else}
                        <Badge variant="outline" class="text-xs">Default</Badge>
                      {/if}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Input
                      type="number"
                      step="0.1"
                      bind:value={serviceTariffs[index].first_km}
                      class="w-20"
                      required
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Input
                      type="number"
                      step="100"
                      bind:value={serviceTariffs[index].first_km_price}
                      class="w-28"
                      required
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Input
                      type="number"
                      step="100"
                      bind:value={serviceTariffs[index].next_km_price}
                      class="w-28"
                      required
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Input
                      type="number"
                      step="0.1"
                      bind:value={serviceTariffs[index].driver_radius_km}
                      class="w-20"
                      required
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Input
                      type="number"
                      step="0.1"
                      bind:value={serviceTariffs[index].commission_percent}
                      class="w-20"
                      required
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Input
                      type="number"
                      step="0.1"
                      bind:value={serviceTariffs[index].max_distance_km}
                      class="w-20"
                      required
                    />
                  </Table.Cell>
                </Table.Row>
              {/each}
            </Table.Body>
          </Table.Root>
        </div>
      </Card.Content>
      <Card.Footer class="flex justify-between">
        <Button type="button" variant="outline" onclick={() => goto("/tariff")}>
          Batal
        </Button>
        <Button type="submit" disabled={isSubmitting || !selectedRegencyId}>
          <Save class="mr-2 h-4 w-4" />
          {isSubmitting
            ? `Menyimpan... (${serviceTariffs.length} tarif)`
            : `Simpan ${serviceTariffs.length} Tarif`}
        </Button>
      </Card.Footer>
    </Card.Root>
  </form>
{/if}
