<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { merchantRegistrationStore } from "$lib/stores/merchant-registration.svelte";

  type FormValues = {
    id_card_number: string;
    id_card_image: string;
    selfie_image: string;
    store_front_image: string;
    store_inside_image: string;
  };

  let { onSubmit, isLoading = false }: { onSubmit: (data: FormValues) => Promise<void>; isLoading?: boolean } = $props();

  // Initialize with data from store if available
  let idCardNumber = $state(merchantRegistrationStore.data.id_card_number || "");
  let idCardImage = $state(merchantRegistrationStore.data.id_card_image || "");
  let selfieImage = $state(merchantRegistrationStore.data.selfie_image || "");
  let storeFrontImage = $state(merchantRegistrationStore.data.store_front_image || "");
  let storeInsideImage = $state(merchantRegistrationStore.data.store_inside_image || "");

  let errors = $state<Record<string, string>>({});

  function validateUrl(url: string): boolean {
    if (!url.trim()) return false;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  function validate(): boolean {
    errors = {};

    if (!idCardNumber.trim()) {
      errors.id_card_number = "NIK wajib diisi";
    } else if (idCardNumber.replace(/\D/g, "").length < 16) {
      errors.id_card_number = "NIK minimal 16 digit";
    }

    if (!idCardImage.trim()) {
      errors.id_card_image = "URL foto KTP wajib diisi";
    } else if (!validateUrl(idCardImage)) {
      errors.id_card_image = "URL foto KTP harus valid";
    }

    if (!selfieImage.trim()) {
      errors.selfie_image = "URL foto selfie wajib diisi";
    } else if (!validateUrl(selfieImage)) {
      errors.selfie_image = "URL foto selfie harus valid";
    }

    if (!storeFrontImage.trim()) {
      errors.store_front_image = "URL foto toko depan wajib diisi";
    } else if (!validateUrl(storeFrontImage)) {
      errors.store_front_image = "URL foto toko depan harus valid";
    }

    if (!storeInsideImage.trim()) {
      errors.store_inside_image = "URL foto dalam toko wajib diisi";
    } else if (!validateUrl(storeInsideImage)) {
      errors.store_inside_image = "URL foto dalam toko harus valid";
    }

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (validate()) {
      await onSubmit({
        id_card_number: idCardNumber,
        id_card_image: idCardImage,
        selfie_image: selfieImage,
        store_front_image: storeFrontImage,
        store_inside_image: storeInsideImage,
      });
    }
  }
</script>

<Card>
  <CardHeader>
    <CardTitle>Dokumen Persyaratan</CardTitle>
    <CardDescription>
      Upload dokumen-dokumen yang diperlukan untuk verifikasi
    </CardDescription>
  </CardHeader>
  <CardContent>
    <form onsubmit={handleSubmit} class="space-y-4">
      <div class="space-y-2">
        <Label for="id_card_number">Nomor Induk Kependudukan (NIK)</Label>
        <Input
          id="id_card_number"
          type="text"
          placeholder="3201234567890001"
          maxlength="16"
          bind:value={idCardNumber}
          disabled={isLoading}
          class={errors.id_card_number ? "border-destructive" : ""}
        />
        {#if errors.id_card_number}
          <p class="text-sm text-destructive">{errors.id_card_number}</p>
        {/if}
      </div>

      <div class="space-y-2">
        <Label for="id_card_image">Foto KTP</Label>
        <Input
          id="id_card_image"
          type="url"
          placeholder="https://example.com/ktp.jpg"
          bind:value={idCardImage}
          disabled={isLoading}
          class={errors.id_card_image ? "border-destructive" : ""}
        />
        {#if errors.id_card_image}
          <p class="text-sm text-destructive">{errors.id_card_image}</p>
        {/if}
        <p class="text-xs text-muted-foreground">Upload foto KTP yang jelas dan masih berlaku</p>
      </div>

      <div class="space-y-2">
        <Label for="selfie_image">Foto Selfie dengan KTP</Label>
        <Input
          id="selfie_image"
          type="url"
          placeholder="https://example.com/selfie.jpg"
          bind:value={selfieImage}
          disabled={isLoading}
          class={errors.selfie_image ? "border-destructive" : ""}
        />
        {#if errors.selfie_image}
          <p class="text-sm text-destructive">{errors.selfie_image}</p>
        {/if}
        <p class="text-xs text-muted-foreground">Upload foto selfie memegang KTP</p>
      </div>

      <div class="space-y-2">
        <Label for="store_front_image">Foto Depan Toko</Label>
        <Input
          id="store_front_image"
          type="url"
          placeholder="https://example.com/toko-depan.jpg"
          bind:value={storeFrontImage}
          disabled={isLoading}
          class={errors.store_front_image ? "border-destructive" : ""}
        />
        {#if errors.store_front_image}
          <p class="text-sm text-destructive">{errors.store_front_image}</p>
        {/if}
        <p class="text-xs text-muted-foreground">Upload foto tampak depan toko/lokasi bisnis</p>
      </div>

      <div class="space-y-2">
        <Label for="store_inside_image">Foto Dalam Toko</Label>
        <Input
          id="store_inside_image"
          type="url"
          placeholder="https://example.com/toko-dalam.jpg"
          bind:value={storeInsideImage}
          disabled={isLoading}
          class={errors.store_inside_image ? "border-destructive" : ""}
        />
        {#if errors.store_inside_image}
          <p class="text-sm text-destructive">{errors.store_inside_image}</p>
        {/if}
        <p class="text-xs text-muted-foreground">Upload foto bagian dalam toko/lokasi bisnis</p>
      </div>

      <div class="bg-muted/50 p-4 rounded-md">
        <p class="text-sm font-medium">Catatan:</p>
        <ul class="text-sm text-muted-foreground list-disc list-inside mt-2">
          <li>Pastikan semua foto jelas dan tidak buram</li>
          <li>Ukuran file maksimal 5MB per foto</li>
          <li>Format file yang didukung: JPG, PNG</li>
          <li>Pastikan NIK sesuai dengan KTP yang diupload</li>
        </ul>
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
