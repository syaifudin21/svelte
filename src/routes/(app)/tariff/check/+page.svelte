<script lang="ts">
  import * as Card from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import * as Select from "$lib/components/ui/select";
  import { tariffService } from "$lib/services/tariff.service";
  import {
    serviceService,
    regencyService,
  } from "$lib/services/service.service";
  import type { Service, Regency } from "$lib/types/service";
  import type { PricingPreview } from "$lib/types/tariff";
  import { onMount } from "svelte";
  import { RefreshCw, Calculator, MapPin, Navigation } from "lucide-svelte";
  import { toast } from "svelte-sonner";

  let services = $state<Service[]>([]);
  let regencies = $state<Regency[]>([]);
  let loading = $state(false);
  let calculating = $state(false);

  // Form state
  let selectedServiceId = $state<string>("");
  let selectedRegencyId = $state<string>("");
  let distance = $state<number>(1);

  // Result state
  let result = $state<PricingPreview | null>(null);

  async function loadData() {
    loading = true;
    try {
      const [servicesRes, regenciesRes] = await Promise.all([
        serviceService.getServices(),
        regencyService.getRegencies(),
      ]);
      services = servicesRes.data;
      regencies = regenciesRes.data;
    } catch (err) {
      toast.error("Gagal memuat data filter");
    } finally {
      loading = false;
    }
  }

  async function handleCalculate() {
    if (!selectedServiceId || !selectedRegencyId || distance <= 0) {
      toast.error("Harap isi semua data dengan benar");
      return;
    }

    calculating = true;
    try {
      const res = await tariffService.getPricingPreview({
        service_id: parseInt(selectedServiceId),
        regency_id: selectedRegencyId,
        distance_km: distance,
      });
      result = res.data;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menghitung tarif");
    } finally {
      calculating = false;
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  onMount(loadData);
</script>

<div class="flex flex-col gap-6 p-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Cek Tarif</h1>
      <p class="text-muted-foreground">
        Simulasi perhitungan biaya berdasarkan wilayah dan jarak.
      </p>
    </div>
  </div>

  <div class="grid gap-6 md:grid-cols-2">
    <!-- Calculation Form -->
    <Card.Root>
      <Card.Header>
        <Card.Title>Parameter Simulasi</Card.Title>
        <Card.Description
          >Masukkan data untuk menghitung estimasi harga.</Card.Description
        >
      </Card.Header>
      <Card.Content class="space-y-4">
        <div class="space-y-2">
          <Label>Layanan</Label>
          <Select.Root
            type="single"
            value={selectedServiceId}
            onValueChange={(v) => (selectedServiceId = v)}
          >
            <Select.Trigger>
              <span data-slot="select-value">
                {#if selectedServiceId}
                  {services.find((s) => s.id.toString() === selectedServiceId)
                    ?.name || "Pilih Layanan"}
                {:else}
                  Pilih Layanan
                {/if}
              </span>
            </Select.Trigger>
            <Select.Content>
              {#each services as service}
                <Select.Item value={service.id.toString()}
                  >{service.name}</Select.Item
                >
              {/each}
            </Select.Content>
          </Select.Root>
        </div>

        <div class="space-y-2">
          <Label>Wilayah (Regency)</Label>
          <Select.Root
            type="single"
            value={selectedRegencyId}
            onValueChange={(v) => (selectedRegencyId = v)}
          >
            <Select.Trigger>
              <span data-slot="select-value">
                {#if selectedRegencyId}
                  {regencies.find((r) => r.id === selectedRegencyId)?.name ||
                    "Pilih Wilayah"}
                {:else}
                  Pilih Wilayah
                {/if}
              </span>
            </Select.Trigger>
            <Select.Content>
              {#each regencies as regency}
                <Select.Item value={regency.id}>{regency.name}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>

        <div class="space-y-2">
          <Label for="distance">Jarak (km)</Label>
          <Input
            id="distance"
            type="number"
            min="0.1"
            step="0.1"
            bind:value={distance}
            placeholder="Contoh: 10"
          />
        </div>
      </Card.Content>
      <Card.Footer>
        <Button class="w-full" onclick={handleCalculate} disabled={calculating}>
          {#if calculating}
            <RefreshCw class="mr-2 h-4 w-4 animate-spin" />
            Menghitung...
          {:else}
            <Calculator class="mr-2 h-4 w-4" />
            Hitung Estimasi
          {/if}
        </Button>
      </Card.Footer>
    </Card.Root>

    <!-- Result Display -->
    <Card.Root>
      <Card.Header>
        <Card.Title>Hasil Estimasi</Card.Title>
        <Card.Description
          >Rincian biaya berdasarkan parameter di samping.</Card.Description
        >
      </Card.Header>
      <Card.Content>
        {#if result}
          <div class="space-y-6">
            <div
              class="flex items-center justify-between rounded-lg bg-muted p-4"
            >
              <div class="flex items-center gap-3">
                <div class="rounded-full bg-primary/10 p-2 text-primary">
                  <Navigation class="h-5 w-5" />
                </div>
                <div>
                  <p class="text-sm font-medium text-muted-foreground">
                    Total Biaya
                  </p>
                  <p class="text-2xl font-bold">
                    {formatCurrency(result.total_price)}
                  </p>
                </div>
              </div>
              <div class="text-right">
                <p class="text-sm font-medium text-muted-foreground">Jarak</p>
                <p class="font-bold">{result.distance_km} km</p>
              </div>
            </div>

            <div class="space-y-3">
              <div class="flex justify-between border-b pb-2">
                <span class="text-muted-foreground">Harga Dasar</span>
                <span class="font-medium"
                  >{formatCurrency(result.base_price)}</span
                >
              </div>
              <div class="flex justify-between border-b pb-2">
                <span class="text-muted-foreground">Komisi Driver</span>
                <span class="font-medium"
                  >{formatCurrency(result.commission_fee)}</span
                >
              </div>
              <div class="flex justify-between border-b pb-2">
                <span class="text-muted-foreground">Biaya Insentif</span>
                <span
                  class={result.incentive_fee > 0
                    ? "text-yellow-600 font-bold"
                    : "text-muted-foreground"}
                >
                  + {formatCurrency(result.incentive_fee)}
                </span>
              </div>
              <div class="flex justify-between pt-1">
                <span class="text-sm text-muted-foreground italic"
                  >Tarif yang digunakan:</span
                >
                <span class="text-sm font-semibold uppercase"
                  >{result.tariff_used}</span
                >
              </div>
            </div>

            {#if result.incentive_expires_at}
              <div
                class="rounded-lg border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800"
              >
                <p class="flex items-center gap-2">
                  <span class="relative flex h-2 w-2">
                    <span
                      class="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-400 opacity-75"
                    ></span>
                    <span
                      class="relative inline-flex h-2 w-2 rounded-full bg-yellow-500"
                    ></span>
                  </span>
                  Insentif aktif hingga {new Date(
                    result.incentive_expires_at,
                  ).toLocaleString("id-ID")}
                </p>
              </div>
            {/if}
          </div>
        {:else}
          <div
            class="flex h-[200px] flex-col items-center justify-center text-muted-foreground"
          >
            <Calculator class="mb-2 h-10 w-10 opacity-20" />
            <p>Klik tombol hitung untuk melihat estimasi.</p>
          </div>
        {/if}
      </Card.Content>
    </Card.Root>
  </div>
</div>
