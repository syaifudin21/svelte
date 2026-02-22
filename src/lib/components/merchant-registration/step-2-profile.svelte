<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Textarea } from "$lib/components/ui/textarea";
  import LocationMap from "./location-map.svelte";
  import { merchantRegistrationStore } from "$lib/stores/merchant-registration.svelte";
  import type { OperationHourItem } from "$lib/types/merchant";

  type FormValues = {
    merchant_name: string;
    category_id: number;
    address: string;
    latitude: number | null;
    longitude: number | null;
    contact_phone: string;
    operation_hours: OperationHourItem[];
  };

  let { onSubmit, isLoading = false }: { onSubmit: (data: FormValues) => Promise<void>; isLoading?: boolean } = $props();

  // Initialize with data from store if available
  let merchantName = $state(merchantRegistrationStore.data.merchant_name || "");
  let categoryId = $state<number | null>(merchantRegistrationStore.data.category_id || null);
  let address = $state(merchantRegistrationStore.data.address || "");
  let latitude = $state<number | null>(merchantRegistrationStore.data.latitude || null);
  let longitude = $state<number | null>(merchantRegistrationStore.data.longitude || null);
  let contactPhone = $state(merchantRegistrationStore.data.contact_phone || "");
  let selectedDays = $state<string[]>(merchantRegistrationStore.data.operation_hours?.map(op => op.day) || []);
  let operationHours = $state<Record<string, { open: string; close: string }>>(
    merchantRegistrationStore.data.operation_hours?.reduce((acc, op) => {
      acc[op.day] = { open: op.open, close: op.close };
      return acc;
    }, {} as Record<string, { open: string; close: string }>) || {}
  );

  let errors = $state<Record<string, string>>({});

  const categories = [
    { value: 1, label: "Food" },
    { value: 2, label: "Mart" },
  ];

  const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

  function toggleDay(day: string) {
    if (selectedDays.includes(day)) {
      selectedDays = selectedDays.filter((d) => d !== day);
      const { [day]: _, ...rest } = operationHours;
      operationHours = rest;
    } else {
      selectedDays = [...selectedDays, day];
      operationHours = { ...operationHours, [day]: { open: "09:00", close: "21:00" } };
    }
  }

  function updateOperationHour(day: string, field: "open" | "close", value: string) {
    operationHours = { ...operationHours, [day]: { ...operationHours[day], [field]: value } };
  }

  function validate(): boolean {
    errors = {};

    if (!merchantName.trim()) {
      errors.merchant_name = "Nama merchant wajib diisi";
    }

    if (!categoryId) {
      errors.category_id = "Kategori wajib dipilih";
    }

    if (!address.trim()) {
      errors.address = "Alamat wajib diisi";
    }

    if (!contactPhone.trim()) {
      errors.contact_phone = "Nomor telepon wajib diisi";
    } else if (contactPhone.replace(/\D/g, "").length < 10) {
      errors.contact_phone = "Nomor telepon minimal 10 digit";
    }

    if (selectedDays.length === 0) {
      errors.operation_hours = "Pilih minimal 1 hari operasional";
    }

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (validate()) {
      const operationHoursArray: OperationHourItem[] = selectedDays.map((day) => ({
        day,
        open: operationHours[day]?.open || "09:00",
        close: operationHours[day]?.close || "21:00",
      }));

      // Ensure latitude and longitude are numbers (default to 0 if null/undefined)
      const lat = (latitude !== null && latitude !== undefined) ? parseFloat(String(latitude)) : 0;
      const lng = (longitude !== null && longitude !== undefined) ? parseFloat(String(longitude)) : 0;

      console.log('[Step2] Submitting with coordinates:', lat, lng);

      await onSubmit({
        merchant_name: merchantName,
        category_id: categoryId!,
        address: address,
        latitude: lat,
        longitude: lng,
        contact_phone: contactPhone,
        operation_hours: operationHoursArray,
      });
    }
  }
</script>

<Card>
  <CardHeader>
    <CardTitle>Profil Bisnis</CardTitle>
    <CardDescription>
      Lengkapi informasi bisnis merchant Anda
    </CardDescription>
  </CardHeader>
  <CardContent>
    <form onsubmit={handleSubmit} class="space-y-4">
      <div class="space-y-2">
        <Label for="merchant_name">Nama Merchant</Label>
        <Input
          id="merchant_name"
          type="text"
          placeholder="Contoh: Warung Makan Padang"
          bind:value={merchantName}
          disabled={isLoading}
          class={errors.merchant_name ? "border-destructive" : ""}
        />
        {#if errors.merchant_name}
          <p class="text-sm text-destructive">{errors.merchant_name}</p>
        {/if}
      </div>

      <div class="space-y-2">
        <Label for="category_id">Kategori Bisnis</Label>
        <select
          id="category_id"
          bind:value={categoryId}
          disabled={isLoading}
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 {errors.category_id ? 'border-destructive' : ''}"
        >
          <option value="">Pilih kategori</option>
          {#each categories as category}
            <option value={category.value}>{category.label}</option>
          {/each}
        </select>
        {#if errors.category_id}
          <p class="text-sm text-destructive">{errors.category_id}</p>
        {/if}
      </div>

      <div class="space-y-2">
        <Label for="address">Alamat Lengkap</Label>
        <Textarea
          id="address"
          placeholder="Masukkan alamat lengkap bisnis Anda"
          bind:value={address}
          disabled={isLoading}
          rows={3}
          class={errors.address ? "border-destructive" : ""}
        />
        {#if errors.address}
          <p class="text-sm text-destructive">{errors.address}</p>
        {/if}
      </div>

      <div class="space-y-2">
        <Label>Lokasi Merchant di Peta</Label>
        <LocationMap
          bind:latitude
          bind:longitude
          disabled={isLoading}
        />
        {#if latitude !== null && latitude !== undefined}
          <div class="grid grid-cols-2 gap-4 mt-4">
            <div class="space-y-2">
              <Label for="latitude">Latitude (dari peta)</Label>
              <Input
                id="latitude"
                type="text"
                inputmode="decimal"
                step="0.000001"
                placeholder="-6.200000"
                value={latitude !== null ? latitude : ''}
                readonly
                disabled={isLoading}
                class="bg-muted cursor-not-allowed"
              />
            </div>
            <div class="space-y-2">
              <Label for="longitude">Longitude (dari peta)</Label>
              <Input
                id="longitude"
                type="text"
                inputmode="decimal"
                step="0.000001"
                placeholder="106.816666"
                value={longitude !== null ? longitude : ''}
                readonly
                disabled={isLoading}
                class="bg-muted cursor-not-allowed"
              />
            </div>
          </div>
        {/if}
      </div>

      <div class="space-y-2">
        <Label for="contact_phone">Nomor Telepon Bisnis</Label>
        <Input
          id="contact_phone"
          type="tel"
          placeholder="0215551234"
          bind:value={contactPhone}
          disabled={isLoading}
          class={errors.contact_phone ? "border-destructive" : ""}
        />
        {#if errors.contact_phone}
          <p class="text-sm text-destructive">{errors.contact_phone}</p>
        {/if}
      </div>

      <div class="space-y-2">
        <Label>Jam Operasional</Label>
        <p class="text-xs text-muted-foreground">Pilih hari operasional bisnis Anda</p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-2">
          {#each days as day}
            <Button
              type="button"
              variant={selectedDays.includes(day) ? "default" : "outline"}
              class="text-sm"
              onclick={() => toggleDay(day)}
              disabled={isLoading}
            >
              {day}
            </Button>
          {/each}
        </div>

        {#if selectedDays.length > 0}
          <div class="mt-4 space-y-3">
            {#each selectedDays as day}
              <div class="flex items-center gap-4 p-3 border rounded-md">
                <span class="w-24 font-medium">{day}</span>
                <div class="flex items-center gap-2">
                  <Label class="text-sm">Buka:</Label>
                  <Input
                    type="time"
                    value={operationHours[day]?.open || "09:00"}
                    oninput={(e) => updateOperationHour(day, "open", e.currentTarget.value)}
                    disabled={isLoading}
                    class="w-32"
                  />
                </div>
                <div class="flex items-center gap-2">
                  <Label class="text-sm">Tutup:</Label>
                  <Input
                    type="time"
                    value={operationHours[day]?.close || "21:00"}
                    oninput={(e) => updateOperationHour(day, "close", e.currentTarget.value)}
                    disabled={isLoading}
                    class="w-32"
                  />
                </div>
              </div>
            {/each}
          </div>
        {/if}

        {#if errors.operation_hours}
          <p class="text-sm text-destructive">{errors.operation_hours}</p>
        {/if}
      </div>

      <Button type="submit" class="w-full" disabled={isLoading}>
        {#if isLoading}
          <span class="animate-spin mr-2">⏳</span>
          Memproses...
        {:else}
          Lanjutkan
        {/if}
      </Button>
    </form>
  </CardContent>
</Card>
