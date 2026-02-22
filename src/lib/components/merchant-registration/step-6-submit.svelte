<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Label } from "$lib/components/ui/label";
  import { merchantRegistrationStore } from "$lib/stores/merchant-registration.svelte";
  import type { RegistrationData } from "$lib/stores/merchant-registration.svelte";

  let { onSubmit, isLoading = false, registrationData }: { 
    onSubmit: (declarationAgreement: boolean) => Promise<void>; 
    isLoading?: boolean;
    registrationData?: RegistrationData | null;
  } = $props();

  let declarationAgreement = $state(false);

  // Use store data if registrationData not provided
  const data = registrationData || merchantRegistrationStore.data;

  async function handleSubmit() {
    await onSubmit(declarationAgreement);
  }
</script>

<Card>
  <CardHeader>
    <CardTitle>Konfirmasi & Kirim</CardTitle>
    <CardDescription>
      Tinjau kembali informasi yang telah diisi dan kirimkan pendaftaran Anda
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div class="space-y-6">
      <!-- Summary Section -->
      <div class="space-y-4">
        <h4 class="font-semibold text-lg">Ringkasan Pendaftaran</h4>
        
        {#if registrationData}
          <!-- Step 1 Summary -->
          <div class="border rounded-md p-4 space-y-2">
            <div class="font-medium">Informasi Pribadi</div>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="text-muted-foreground">Nama:</div>
              <div>{registrationData.full_name}</div>
              <div class="text-muted-foreground">Email:</div>
              <div>{registrationData.email}</div>
              <div class="text-muted-foreground">Telepon:</div>
              <div>{registrationData.phone_number}</div>
              <div class="text-muted-foreground">Area Kerja:</div>
              <div>{registrationData.work_area_id}</div>
            </div>
          </div>

          <!-- Step 2 Summary -->
          <div class="border rounded-md p-4 space-y-2">
            <div class="font-medium">Profil Bisnis</div>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="text-muted-foreground">Nama Merchant:</div>
              <div>{registrationData.merchant_name}</div>
              <div class="text-muted-foreground">Alamat:</div>
              <div>{registrationData.address}</div>
              <div class="text-muted-foreground">Telepon Bisnis:</div>
              <div>{registrationData.contact_phone}</div>
            </div>
          </div>

          <!-- Step 3 Summary -->
          <div class="border rounded-md p-4 space-y-2">
            <div class="font-medium">Dokumen</div>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="text-muted-foreground">NIK:</div>
              <div>{registrationData.id_card_number}</div>
              <div class="text-muted-foreground">Foto KTP:</div>
              <div class="truncate">{registrationData.id_card_image}</div>
              <div class="text-muted-foreground">Selfie:</div>
              <div class="truncate">{registrationData.selfie_image}</div>
            </div>
          </div>

          <!-- Step 4 Summary -->
          <div class="border rounded-md p-4 space-y-2">
            <div class="font-medium">Rekening Bank</div>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div class="text-muted-foreground">Bank:</div>
              <div>{registrationData.bank_code}</div>
              <div class="text-muted-foreground">Nomor Rekening:</div>
              <div>{registrationData.account_number}</div>
              <div class="text-muted-foreground">Pemilik:</div>
              <div>{registrationData.account_holder_name}</div>
            </div>
          </div>

          <!-- Step 5 Summary -->
          <div class="border rounded-md p-4 space-y-2">
            <div class="font-medium">Produk ({registrationData.menu_items?.length || 0})</div>
            {#each registrationData.menu_items || [] as item, index}
              <div class="text-sm">
                <div class="font-medium">{index + 1}. {item.name}</div>
                <div class="text-muted-foreground">Rp {item.price.toLocaleString('id-ID')} - {item.category}</div>
              </div>
            {/each}
          </div>
        {:else}
          <p class="text-muted-foreground">Data tidak tersedia</p>
        {/if}
      </div>

      <!-- Declaration -->
      <div class="border rounded-md p-4 space-y-4 bg-muted/50">
        <h4 class="font-medium">Pernyataan</h4>
        <div class="flex items-start space-x-2">
          <input
            type="checkbox"
            id="declaration"
            checked={declarationAgreement}
            onchange={(e) => declarationAgreement = e.currentTarget.checked}
            disabled={isLoading}
            class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary mt-1"
          />
          <Label
            for="declaration"
            class="text-sm font-normal cursor-pointer"
          >
            Saya menyatakan bahwa seluruh informasi yang saya berikan adalah
            benar dan dapat dipertanggungjawabkan. Saya bersedia mematuhi
            semua ketentuan dan persyaratan yang berlaku.
          </Label>
        </div>
      </div>

      <!-- Submit Button -->
      <Button
        class="w-full"
        onclick={handleSubmit}
        disabled={!declarationAgreement || isLoading}
      >
        {#if isLoading}
          <span class="animate-spin mr-2">⏳</span>
          Mengirim...
        {:else}
          Kirim Pendaftaran
        {/if}
      </Button>

      <p class="text-xs text-center text-muted-foreground">
        Setelah dikirim, pendaftaran Anda akan diverifikasi oleh tim kami.
        Proses verifikasi biasanya memakan waktu 1-3 hari kerja.
      </p>
    </div>
  </CardContent>
</Card>
