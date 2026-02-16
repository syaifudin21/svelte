<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import * as Select from "$lib/components/ui/select";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import type { Service } from "$lib/types/service";
  import type { Tariff, TariffFormData } from "$lib/types/tariff";
  import type { Province, RegencyOption } from "$lib/types/region";
  import { regionService } from "$lib/services/region.service";
  import { onMount } from "svelte";

  interface Props {
    open: boolean;
    tariff?: Tariff | null;
    services: Service[];
    onClose: () => void;
    onSave: (data: TariffFormData, id?: number) => Promise<void>;
  }

  let { open = $bindable(), tariff, services, onClose, onSave }: Props = $props();

  let formData = $state<TariffFormData>({
    service_id: 0,
    regency_id: "",
    first_km: 1,
    first_km_price: 0,
    next_km_price: 0,
    driver_radius_km: 5,
    commission_percent: 10,
    max_distance_km: 50,
  });

  let isSubmitting = $state(false);
  let selectedServiceId = $state<string>("");
  let selectedProvinceId = $state<string>("");
  let selectedRegencyId = $state<string>("");
  
  let provinces = $state<Province[]>([]);
  let regencies = $state<RegencyOption[]>([]);
  let loadingRegencies = $state(false);

  async function loadProvinces() {
    try {
      const response = await regionService.getProvinces();
      provinces = response.data;
    } catch (error) {
      console.error("Failed to load provinces", error);
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
    } finally {
      loadingRegencies = false;
    }
  }

  $effect(() => {
    if (tariff) {
      formData = {
        service_id: tariff.service_id,
        regency_id: tariff.regency?.id.toString() || "",
        first_km: tariff.first_km,
        first_km_price: tariff.first_km_price,
        next_km_price: tariff.next_km_price,
        driver_radius_km: tariff.driver_radius_km,
        commission_percent: tariff.commission_percent,
        max_distance_km: tariff.max_distance_km,
      };
      selectedServiceId = tariff.service_id.toString();
      selectedRegencyId = tariff.regency?.id.toString() || "";
      
      // Load province based on existing regency
      if (tariff.regency?.province?.id) {
        selectedProvinceId = tariff.regency.province.id.toString();
        loadRegencies(selectedProvinceId);
      }
    } else {
      formData = {
        service_id: 0,
        regency_id: "",
        first_km: 1,
        first_km_price: 0,
        next_km_price: 0,
        driver_radius_km: 5,
        commission_percent: 10,
        max_distance_km: 50,
      };
      selectedServiceId = "";
      selectedProvinceId = "";
      selectedRegencyId = "";
      regencies = [];
    }
  });

  $effect(() => {
    if (selectedServiceId) {
      formData.service_id = parseInt(selectedServiceId);
    }
  });

  $effect(() => {
    if (selectedProvinceId) {
      loadRegencies(selectedProvinceId);
      // Reset regency selection when province changes
      if (selectedRegencyId) {
        const regencyStillValid = regencies.some(r => r.id === selectedRegencyId);
        if (!regencyStillValid) {
          selectedRegencyId = "";
          formData.regency_id = "";
        }
      }
    } else {
      regencies = [];
      selectedRegencyId = "";
      formData.regency_id = "";
    }
  });

  $effect(() => {
    if (selectedRegencyId) {
      formData.regency_id = selectedRegencyId;
    }
  });

  async function handleSubmit() {
    isSubmitting = true;
    try {
      await onSave(formData, tariff?.id);
      open = false;
    } catch (error) {
      console.error("Failed to save tariff", error);
    } finally {
      isSubmitting = false;
    }
  }

  onMount(() => {
    loadProvinces();
  });
</script>

<Dialog.Root bind:open>
  <Dialog.Content class="max-w-2xl">
    <Dialog.Header>
      <Dialog.Title>{tariff ? 'Edit Tarif' : 'Tambah Tarif'}</Dialog.Title>
      <Dialog.Description>
        {tariff ? 'Perbarui konfigurasi tarif' : 'Tambahkan konfigurasi tarif baru'}
      </Dialog.Description>
    </Dialog.Header>

    <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="service">Service *</Label>
          <Select.Root type="single" bind:value={selectedServiceId}>
            <Select.Trigger id="service">
              <span data-slot="select-value">
                {#if selectedServiceId}
                  {services.find(s => s.id.toString() === selectedServiceId)?.name || "Pilih Service"}
                {:else}
                  Pilih Service
                {/if}
              </span>
            </Select.Trigger>
            <Select.Content>
              {#each services as service}
                <Select.Item value={service.id.toString()}>{service.name}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>

        <div class="space-y-2">
          <Label for="province">Province *</Label>
          <Select.Root type="single" bind:value={selectedProvinceId}>
            <Select.Trigger id="province">
              <span data-slot="select-value">
                {#if selectedProvinceId}
                  {provinces.find(p => p.id === selectedProvinceId)?.name || "Pilih Province"}
                {:else}
                  Pilih Province
                {/if}
              </span>
            </Select.Trigger>
            <Select.Content>
              {#each provinces as province}
                <Select.Item value={province.id}>{province.name}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>
      </div>

      <div class="space-y-2">
        <Label for="regency">Regency *</Label>
        <Select.Root type="single" bind:value={selectedRegencyId} disabled={!selectedProvinceId || loadingRegencies}>
          <Select.Trigger id="regency">
            <span data-slot="select-value">
              {#if loadingRegencies}
                Loading...
              {:else if selectedRegencyId}
                {regencies.find(r => r.id === selectedRegencyId)?.name || "Pilih Regency"}
              {:else if !selectedProvinceId}
                Pilih Province terlebih dahulu
              {:else}
                Pilih Regency
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

      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="first_km">First KM *</Label>
          <Input id="first_km" type="number" step="0.1" bind:value={formData.first_km} required />
        </div>

        <div class="space-y-2">
          <Label for="first_km_price">First KM Price *</Label>
          <Input id="first_km_price" type="number" step="100" bind:value={formData.first_km_price} required />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="next_km_price">Next KM Price *</Label>
          <Input id="next_km_price" type="number" step="100" bind:value={formData.next_km_price} required />
        </div>

        <div class="space-y-2">
          <Label for="driver_radius_km">Driver Radius (km) *</Label>
          <Input id="driver_radius_km" type="number" step="0.1" bind:value={formData.driver_radius_km} required />
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="commission_percent">Commission (%) *</Label>
          <Input id="commission_percent" type="number" step="0.1" bind:value={formData.commission_percent} required />
        </div>

        <div class="space-y-2">
          <Label for="max_distance_km">Max Distance (km) *</Label>
          <Input id="max_distance_km" type="number" step="0.1" bind:value={formData.max_distance_km} required />
        </div>
      </div>

      <Dialog.Footer>
        <Button type="button" variant="outline" onclick={onClose}>Batal</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </Dialog.Footer>
    </form>
  </Dialog.Content>
</Dialog.Root>
