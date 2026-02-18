<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Switch } from "$lib/components/ui/switch/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import {
    Database,
    MapPin,
    CreditCard,
    Layers,
    ChevronRight,
    ChevronLeft,
  } from "lucide-svelte";
  import { regionService } from "$lib/services/region.service";
  import { paymentMethodService } from "$lib/services/payment-method.service";
  import { serviceService } from "$lib/services/service.service";
  import type {
    Province,
    RegencyOption,
    District,
    Village,
  } from "$lib/types/region";
  import type { PaymentMethod } from "$lib/types/payment-method";
  import type { Service } from "$lib/types/service";
  import { onMount } from "svelte";

  // Data states
  let provinces = $state<Province[]>([]);
  let paymentMethods = $state<PaymentMethod[]>([]);
  let services = $state<Service[]>([]);

  // Region drill-down state
  let currentLevel = $state<
    "provinces" | "regencies" | "districts" | "villages"
  >("provinces");
  let currentRegencies = $state<RegencyOption[]>([]);
  let currentDistricts = $state<District[]>([]);
  let currentVillages = $state<Village[]>([]);

  // Selection state
  let selectedProvince = $state<Province | null>(null);
  let selectedRegency = $state<RegencyOption | null>(null);
  let selectedDistrict = $state<District | null>(null);

  let isLoading = $state(true);
  let isLevelLoading = $state(false);

  onMount(async () => {
    try {
      const [pRes, pmRes, sRes] = await Promise.all([
        regionService.getProvinces(),
        paymentMethodService.getPaymentMethods(),
        serviceService.getServices(),
      ]);
      provinces = pRes.data;
      paymentMethods = pmRes.data;
      services = sRes.data;
    } catch (error) {
      console.error("Failed to fetch data-library items:", error);
    } finally {
      isLoading = false;
    }
  });

  // Drill-down actions
  async function selectProvince(province: Province) {
    selectedProvince = province;
    isLevelLoading = true;
    try {
      const res = await regionService.getRegenciesByProvince(province.id);
      currentRegencies = res.data;
      currentLevel = "regencies";
    } catch (e) {
      console.error(e);
    } finally {
      isLevelLoading = false;
    }
  }

  async function selectRegency(regency: RegencyOption) {
    selectedRegency = regency;
    isLevelLoading = true;
    try {
      const res = await regionService.getDistricts(
        selectedProvince!.id,
        regency.id,
      );
      currentDistricts = res.data;
      currentLevel = "districts";
    } catch (e) {
      console.error(e);
    } finally {
      isLevelLoading = false;
    }
  }

  async function selectDistrict(district: District) {
    selectedDistrict = district;
    isLevelLoading = true;
    try {
      const res = await regionService.getVillages(
        selectedProvince!.id,
        selectedRegency!.id,
        district.id,
      );
      currentVillages = res.data;
      currentLevel = "villages";
    } catch (e) {
      console.error(e);
    } finally {
      isLevelLoading = false;
    }
  }

  function goToLevel(level: typeof currentLevel) {
    if (level === "provinces") {
      selectedProvince = null;
      selectedRegency = null;
      selectedDistrict = null;
    } else if (level === "regencies") {
      selectedRegency = null;
      selectedDistrict = null;
    } else if (level === "districts") {
      selectedDistrict = null;
    }
    currentLevel = level;
  }

  async function togglePaymentMethodStatus(pm: PaymentMethod) {
    const originalStatus = pm.is_available;
    try {
      // Optimistic update
      pm.is_available = !pm.is_available;
      await paymentMethodService.updateStatus(pm.id, pm.is_available);
    } catch (error) {
      console.error("Failed to update payment method status:", error);
      pm.is_available = originalStatus; // Revert on failure
    }
  }

  async function toggleServiceStatus(svc: Service) {
    const originalStatus = svc.is_available;
    try {
      // Optimistic update
      svc.is_available = !svc.is_available;
      await serviceService.updateStatus(svc.id, svc.is_available);
    } catch (error) {
      console.error("Failed to update service status:", error);
      svc.is_available = originalStatus; // Revert on failure
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }
</script>

<div class="flex flex-col gap-6">
  <div class="flex items-center gap-2">
    <Database class="size-6 text-primary" />
    <h1 class="text-3xl font-bold tracking-tight">Data Library</h1>
  </div>

  <Tabs.Root value="regions" class="w-full">
    <Tabs.List class="grid w-full grid-cols-3 max-w-md">
      <Tabs.Trigger value="regions" class="flex items-center gap-2">
        <MapPin class="size-4" />
        Regions
      </Tabs.Trigger>
      <Tabs.Trigger value="payments" class="flex items-center gap-2">
        <CreditCard class="size-4" />
        Payments
      </Tabs.Trigger>
      <Tabs.Trigger value="services" class="flex items-center gap-2">
        <Layers class="size-4" />
        Services
      </Tabs.Trigger>
    </Tabs.List>

    <!-- Regions Tab -->
    <Tabs.Content value="regions" class="mt-6">
      <Card.Root>
        <Card.Header>
          <div class="flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <div>
                <Card.Title>
                  {#if currentLevel === "provinces"}
                    Daftar Wilayah (Provinsi)
                  {:else if currentLevel === "regencies"}
                    Kabupaten di {selectedProvince?.name}
                  {:else if currentLevel === "districts"}
                    Kecamatan di {selectedRegency?.name}
                  {:else if currentLevel === "villages"}
                    Kelurahan di {selectedDistrict?.name}
                  {/if}
                </Card.Title>
                <Card.Description>
                  {#if currentLevel === "provinces"}
                    Data wilayah operasional yang terdaftar dalam sistem.
                  {:else}
                    Klik baris untuk merinci data atau gunakan breadcrumb di
                    atas.
                  {/if}
                </Card.Description>
              </div>
            </div>
            <Separator />

            <!-- Breadcrumbs Navigation moved inside Card -->
            <Breadcrumb.Root>
              <Breadcrumb.List>
                <Breadcrumb.Item>
                  <Breadcrumb.Link
                    onclick={() => goToLevel("provinces")}
                    class="cursor-pointer"
                  >
                    Provinces
                  </Breadcrumb.Link>
                </Breadcrumb.Item>

                {#if selectedProvince}
                  <Breadcrumb.Separator />
                  <Breadcrumb.Item>
                    <Breadcrumb.Link
                      onclick={() => goToLevel("regencies")}
                      class="cursor-pointer"
                    >
                      {selectedProvince.name}
                    </Breadcrumb.Link>
                  </Breadcrumb.Item>
                {/if}

                {#if selectedRegency}
                  <Breadcrumb.Separator />
                  <Breadcrumb.Item>
                    <Breadcrumb.Link
                      onclick={() => goToLevel("districts")}
                      class="cursor-pointer"
                    >
                      {selectedRegency.name}
                    </Breadcrumb.Link>
                  </Breadcrumb.Item>
                {/if}

                {#if selectedDistrict}
                  <Breadcrumb.Separator />
                  <Breadcrumb.Item>
                    <Breadcrumb.Page>{selectedDistrict.name}</Breadcrumb.Page>
                  </Breadcrumb.Item>
                {/if}
              </Breadcrumb.List>
            </Breadcrumb.Root>
            <Separator />
          </div>
        </Card.Header>
        <Card.Content>
          {#if isLoading || isLevelLoading}
            <div class="flex h-32 items-center justify-center">
              Memuat data...
            </div>
          {:else}
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.Head class="w-24">ID</Table.Head>
                  <Table.Head>Nama</Table.Head>
                  {#if currentLevel !== "villages"}
                    <Table.Head class="w-10"></Table.Head>
                  {/if}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                <!-- Provinces -->
                {#if currentLevel === "provinces"}
                  {#each provinces as province}
                    <Table.Row
                      class="cursor-pointer hover:bg-muted/50"
                      onclick={() => selectProvince(province)}
                    >
                      <Table.Cell class="font-medium text-muted-foreground"
                        >{province.id}</Table.Cell
                      >
                      <Table.Cell>{province.name}</Table.Cell>
                      <Table.Cell
                        ><ChevronRight
                          class="size-4 text-muted-foreground"
                        /></Table.Cell
                      >
                    </Table.Row>
                  {/each}

                  <!-- Regencies -->
                {:else if currentLevel === "regencies"}
                  {#each currentRegencies as regency}
                    <Table.Row
                      class="cursor-pointer hover:bg-muted/50"
                      onclick={() => selectRegency(regency)}
                    >
                      <Table.Cell class="font-medium text-muted-foreground"
                        >{regency.id}</Table.Cell
                      >
                      <Table.Cell>{regency.name}</Table.Cell>
                      <Table.Cell
                        ><ChevronRight
                          class="size-4 text-muted-foreground"
                        /></Table.Cell
                      >
                    </Table.Row>
                  {/each}

                  <!-- Districts -->
                {:else if currentLevel === "districts"}
                  {#each currentDistricts as district}
                    <Table.Row
                      class="cursor-pointer hover:bg-muted/50"
                      onclick={() => selectDistrict(district)}
                    >
                      <Table.Cell class="font-medium text-muted-foreground"
                        >{district.id}</Table.Cell
                      >
                      <Table.Cell>{district.name}</Table.Cell>
                      <Table.Cell
                        ><ChevronRight
                          class="size-4 text-muted-foreground"
                        /></Table.Cell
                      >
                    </Table.Row>
                  {/each}

                  <!-- Villages -->
                {:else if currentLevel === "villages"}
                  {#each currentVillages as village}
                    <Table.Row>
                      <Table.Cell class="font-medium text-muted-foreground"
                        >{village.id}</Table.Cell
                      >
                      <Table.Cell>{village.name}</Table.Cell>
                    </Table.Row>
                  {/each}
                {/if}
              </Table.Body>
            </Table.Root>
          {/if}
        </Card.Content>
      </Card.Root>
    </Tabs.Content>

    <!-- Payment Methods Tab -->
    <Tabs.Content value="payments" class="mt-6">
      <Card.Root>
        <Card.Header>
          <Card.Title>Metode Pembayaran</Card.Title>
          <Card.Description
            >Kelola metode pembayaran yang tersedia untuk pengguna.</Card.Description
          >
        </Card.Header>
        <Card.Content>
          {#if isLoading}
            <div class="flex h-32 items-center justify-center">
              Memuat data...
            </div>
          {:else}
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Nama</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head>Dibuat Pada</Table.Head>
                  <Table.Head class="text-right">Aksi</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {#each paymentMethods as pm}
                  <Table.Row>
                    <Table.Cell class="font-medium">{pm.name}</Table.Cell>
                    <Table.Cell>
                      <Badge
                        variant={pm.is_available ? "default" : "secondary"}
                      >
                        {pm.is_available ? "Tersedia" : "Tidak Tersedia"}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell class="text-muted-foreground"
                      >{formatDate(pm.created_at)}</Table.Cell
                    >
                    <Table.Cell class="text-right">
                      <Switch
                        checked={pm.is_available}
                        onCheckedChange={() => togglePaymentMethodStatus(pm)}
                      />
                    </Table.Cell>
                  </Table.Row>
                {/each}
              </Table.Body>
            </Table.Root>
          {/if}
        </Card.Content>
      </Card.Root>
    </Tabs.Content>

    <!-- Services Tab -->
    <Tabs.Content value="services" class="mt-6">
      <Card.Root>
        <Card.Header>
          <Card.Title>Daftar Layanan</Card.Title>
          <Card.Description
            >Layanan ride-hailing yang tersedia di platform.</Card.Description
          >
        </Card.Header>
        <Card.Content>
          {#if isLoading}
            <div class="flex h-32 items-center justify-center">
              Memuat data...
            </div>
          {:else}
            <Table.Root>
              <Table.Header>
                <Table.Row>
                  <Table.Head>Layanan</Table.Head>
                  <Table.Head>Deskripsi</Table.Head>
                  <Table.Head>Status</Table.Head>
                  <Table.Head class="text-right">Aksi</Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {#each services as svc}
                  <Table.Row>
                    <Table.Cell class="font-medium">{svc.name}</Table.Cell>
                    <Table.Cell class="max-w-md">{svc.description}</Table.Cell>
                    <Table.Cell>
                      <Badge
                        variant={svc.is_available ? "default" : "secondary"}
                      >
                        {svc.is_available ? "Aktif" : "Non-aktif"}
                      </Badge>
                    </Table.Cell>
                    <Table.Cell class="text-right">
                      <Switch
                        checked={svc.is_available}
                        onCheckedChange={() => toggleServiceStatus(svc)}
                      />
                    </Table.Cell>
                  </Table.Row>
                {/each}
              </Table.Body>
            </Table.Root>
          {/if}
        </Card.Content>
      </Card.Root>
    </Tabs.Content>
  </Tabs.Root>
</div>
