<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
  import FileUploadDialog from "$lib/components/file-upload-dialog.svelte";
  import { fileService } from "$lib/services/file.service";
  import { merchantRegistrationStore } from "$lib/stores/merchant-registration.svelte";
  import UploadIcon from "@tabler/icons-svelte/icons/upload";
  import FileIcon from "@tabler/icons-svelte/icons/file";
  import EyeIcon from "@tabler/icons-svelte/icons/eye";
  import type { FileData } from "$lib/services/file.service";

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

  // Dialog states
  let idCardDialogOpen = $state(false);
  let selfieDialogOpen = $state(false);
  let storeFrontDialogOpen = $state(false);
  let storeInsideDialogOpen = $state(false);

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

  function handleFileSelect(field: string, file: FileData) {
    const url = fileService.getFileUrl(file.path);
    switch (field) {
      case 'id_card':
        idCardImage = url;
        break;
      case 'selfie':
        selfieImage = url;
        break;
      case 'store_front':
        storeFrontImage = url;
        break;
      case 'store_inside':
        storeInsideImage = url;
        break;
    }
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
        <div class="flex gap-2">
          <Input
            id="id_card_image"
            type="text"
            placeholder="Pilih file atau upload..."
            bind:value={idCardImage}
            disabled={isLoading}
            class={errors.id_card_image ? "border-destructive" : ""}
            readonly
          />
          <Button type="button" variant="outline" onclick={() => idCardDialogOpen = true} disabled={isLoading}>
            <UploadIcon class="h-4 w-4" />
          </Button>
          {#if idCardImage}
            <a href={idCardImage} target="_blank">
              <Button type="button" variant="outline" disabled={isLoading}>
                <EyeIcon class="h-4 w-4" />
              </Button>
            </a>
          {/if}
        </div>
        {#if errors.id_card_image}
          <p class="text-sm text-destructive">{errors.id_card_image}</p>
        {/if}
        <p class="text-xs text-muted-foreground">Upload foto KTP yang jelas dan masih berlaku</p>
      </div>

      <div class="space-y-2">
        <Label for="selfie_image">Foto Selfie dengan KTP</Label>
        <div class="flex gap-2">
          <Input
            id="selfie_image"
            type="text"
            placeholder="Pilih file atau upload..."
            bind:value={selfieImage}
            disabled={isLoading}
            class={errors.selfie_image ? "border-destructive" : ""}
            readonly
          />
          <Button type="button" variant="outline" onclick={() => selfieDialogOpen = true} disabled={isLoading}>
            <UploadIcon class="h-4 w-4" />
          </Button>
          {#if selfieImage}
            <a href={selfieImage} target="_blank">
              <Button type="button" variant="outline" disabled={isLoading}>
                <EyeIcon class="h-4 w-4" />
              </Button>
            </a>
          {/if}
        </div>
        {#if errors.selfie_image}
          <p class="text-sm text-destructive">{errors.selfie_image}</p>
        {/if}
        <p class="text-xs text-muted-foreground">Upload foto selfie memegang KTP</p>
      </div>

      <div class="space-y-2">
        <Label for="store_front_image">Foto Depan Toko</Label>
        <div class="flex gap-2">
          <Input
            id="store_front_image"
            type="text"
            placeholder="Pilih file atau upload..."
            bind:value={storeFrontImage}
            disabled={isLoading}
            class={errors.store_front_image ? "border-destructive" : ""}
            readonly
          />
          <Button type="button" variant="outline" onclick={() => storeFrontDialogOpen = true} disabled={isLoading}>
            <UploadIcon class="h-4 w-4" />
          </Button>
          {#if storeFrontImage}
            <a href={storeFrontImage} target="_blank">
              <Button type="button" variant="outline" disabled={isLoading}>
                <EyeIcon class="h-4 w-4" />
              </Button>
            </a>
          {/if}
        </div>
        {#if errors.store_front_image}
          <p class="text-sm text-destructive">{errors.store_front_image}</p>
        {/if}
        <p class="text-xs text-muted-foreground">Upload foto tampak depan toko/lokasi bisnis</p>
      </div>

      <div class="space-y-2">
        <Label for="store_inside_image">Foto Dalam Toko</Label>
        <div class="flex gap-2">
          <Input
            id="store_inside_image"
            type="text"
            placeholder="Pilih file atau upload..."
            bind:value={storeInsideImage}
            disabled={isLoading}
            class={errors.store_inside_image ? "border-destructive" : ""}
            readonly
          />
          <Button type="button" variant="outline" onclick={() => storeInsideDialogOpen = true} disabled={isLoading}>
            <UploadIcon class="h-4 w-4" />
          </Button>
          {#if storeInsideImage}
            <a href={storeInsideImage} target="_blank">
              <Button type="button" variant="outline" disabled={isLoading}>
                <EyeIcon class="h-4 w-4" />
              </Button>
            </a>
          {/if}
        </div>
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

  <FileUploadDialog
    open={idCardDialogOpen}
    title="Upload Foto KTP"
    description="Upload foto KTP atau pilih dari file yang sudah ada"
    defaultFileName="ktp"
    onFileSelect={(file) => handleFileSelect('id_card', file)}
  />

  <FileUploadDialog
    open={selfieDialogOpen}
    title="Upload Foto Selfie"
    description="Upload foto selfie dengan KTP atau pilih dari file yang sudah ada"
    defaultFileName="selfie-ktp"
    onFileSelect={(file) => handleFileSelect('selfie', file)}
  />

  <FileUploadDialog
    open={storeFrontDialogOpen}
    title="Upload Foto Depan Toko"
    description="Upload foto depan toko atau pilih dari file yang sudah ada"
    defaultFileName="depan-toko"
    onFileSelect={(file) => handleFileSelect('store_front', file)}
  />

  <FileUploadDialog
    open={storeInsideDialogOpen}
    title="Upload Foto Dalam Toko"
    description="Upload foto dalam toko atau pilih dari file yang sudah ada"
    defaultFileName="dalam-toko"
    onFileSelect={(file) => handleFileSelect('store_inside', file)}
  />
</Card>
