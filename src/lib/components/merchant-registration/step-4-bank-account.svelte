<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { merchantRegistrationStore } from "$lib/stores/merchant-registration.svelte";

  type FormValues = {
    bank_code: string;
    account_number: string;
    account_holder_name: string;
  };

  let { onSubmit, isLoading = false }: { onSubmit: (data: FormValues) => Promise<void>; isLoading?: boolean } = $props();

  // Initialize with data from store if available
  let bankCode = $state(merchantRegistrationStore.data.bank_code || "");
  let accountNumber = $state(merchantRegistrationStore.data.account_number || "");
  let accountHolderName = $state(merchantRegistrationStore.data.account_holder_name || "");

  let errors = $state<Record<string, string>>({});

  const banks = [
    { value: "BCA", label: "Bank Central Asia (BCA)" },
    { value: "BNI", label: "Bank Negara Indonesia (BNI)" },
    { value: "BRI", label: "Bank Rakyat Indonesia (BRI)" },
    { value: "MANDIRI", label: "Bank Mandiri" },
    { value: "DANAMON", label: "Bank Danamon" },
    { value: "PERMATA", label: "Bank Permata" },
    { value: "CIMB", label: "CIMB Niaga" },
    { value: "OCBC", label: "OCBC NISP" },
    { value: "BTPN", label: "BTPN" },
    { value: "BSI", label: "Bank Syariah Indonesia (BSI)" },
  ];

  function validate(): boolean {
    errors = {};

    if (!bankCode.trim()) {
      errors.bank_code = "Bank wajib dipilih";
    }

    if (!accountNumber.trim()) {
      errors.account_number = "Nomor rekening wajib diisi";
    }

    if (!accountHolderName.trim()) {
      errors.account_holder_name = "Nama pemilik rekening wajib diisi";
    }

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (validate()) {
      await onSubmit({
        bank_code: bankCode,
        account_number: accountNumber,
        account_holder_name: accountHolderName,
      });
    }
  }
</script>

<Card>
  <CardHeader>
    <CardTitle>Informasi Rekening Bank</CardTitle>
    <CardDescription>
      Masukkan informasi rekening bank untuk pencairan dana
    </CardDescription>
  </CardHeader>
  <CardContent>
    <form onsubmit={handleSubmit} class="space-y-4">
      <div class="space-y-2">
        <Label for="bank_code">Bank</Label>
        <select
          id="bank_code"
          bind:value={bankCode}
          disabled={isLoading}
          class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 {errors.bank_code ? 'border-destructive' : ''}"
        >
          <option value="">Pilih bank</option>
          {#each banks as bank}
            <option value={bank.value}>{bank.label}</option>
          {/each}
        </select>
        {#if errors.bank_code}
          <p class="text-sm text-destructive">{errors.bank_code}</p>
        {/if}
      </div>

      <div class="space-y-2">
        <Label for="account_number">Nomor Rekening</Label>
        <Input
          id="account_number"
          type="text"
          placeholder="0123456789"
          bind:value={accountNumber}
          disabled={isLoading}
          class={errors.account_number ? "border-destructive" : ""}
        />
        {#if errors.account_number}
          <p class="text-sm text-destructive">{errors.account_number}</p>
        {/if}
      </div>

      <div class="space-y-2">
        <Label for="account_holder_name">Nama Pemilik Rekening</Label>
        <Input
          id="account_holder_name"
          type="text"
          placeholder="Nama Sesuai Buku Tabungan"
          bind:value={accountHolderName}
          disabled={isLoading}
          class={errors.account_holder_name ? "border-destructive" : ""}
        />
        {#if errors.account_holder_name}
          <p class="text-sm text-destructive">{errors.account_holder_name}</p>
        {/if}
        <p class="text-xs text-muted-foreground">
          Pastikan nama sesuai dengan buku tabungan/rekening
        </p>
      </div>

      <div class="bg-muted/50 p-4 rounded-md">
        <p class="text-sm font-medium">Penting:</p>
        <ul class="text-sm text-muted-foreground list-disc list-inside mt-2">
          <li>Rekening harus atas nama pemilik merchant</li>
          <li>Pastikan nomor rekening aktif dan valid</li>
          <li>Pencairan dana akan ditransfer ke rekening ini</li>
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
