<script lang="ts">
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { Separator } from "$lib/components/ui/separator";
  import { User, Store, MapPin, Phone, Mail, Calendar, Clock, CreditCard, FileText, Image, CheckCircle, XCircle, AlertCircle, Hourglass, Pencil } from "lucide-svelte";
  import { merchantService } from "$lib/services/merchant.service";
  import type { MerchantProfile } from "$lib/types/merchant";
  import { toast } from "svelte-sonner";
  import { onMount } from "svelte";

  let merchant = $state<MerchantProfile | null>(null);
  let isLoading = $state(true);
  let error = $state<string | null>(null);

  onMount(async () => {
    await loadMerchantProfile();
  });

  async function loadMerchantProfile() {
    isLoading = true;
    error = null;
    try {
      const response = await merchantService.getCurrentMerchantProfile();
      // Get first merchant from items array or use single item
      if (response.data?.items && Array.isArray(response.data.items)) {
        merchant = response.data.items[0] || null;
      } else if (response.data) {
        merchant = response.data;
      }
    } catch (err: any) {
      error = err.response?.data?.message || "Gagal memuat profil merchant";
      console.error("Failed to load merchant profile:", err);
    } finally {
      isLoading = false;
    }
  }

  function getStatusBadge(status: string) {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: any; color: string }> = {
      submitted: { variant: "default", label: "Diajukan", icon: Hourglass, color: "text-blue-600" },
      approved: { variant: "secondary", label: "Disetujui", icon: CheckCircle, color: "text-green-600" },
      rejected: { variant: "destructive", label: "Ditolak", icon: XCircle, color: "text-red-600" },
      step1: { variant: "outline", label: "Langkah 1", icon: AlertCircle, color: "text-gray-600" },
      step2: { variant: "outline", label: "Langkah 2", icon: AlertCircle, color: "text-gray-600" },
      step3: { variant: "outline", label: "Langkah 3", icon: AlertCircle, color: "text-gray-600" },
      step4: { variant: "outline", label: "Langkah 4", icon: AlertCircle, color: "text-gray-600" },
      step5: { variant: "outline", label: "Langkah 5", icon: AlertCircle, color: "text-gray-600" },
    };

    const config = statusConfig[status] || { variant: "outline" as const, label: status, icon: AlertCircle, color: "text-gray-600" };
    return { config };
  }

  function getCategoryName(categoryId: number | null): string {
    const categories: Record<number, string> = {
      1: "Food",
      2: "Mart",
    };
    return categories[categoryId || 0] || `Category ${categoryId}`;
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Profil Merchant</h1>
      <p class="text-muted-foreground mt-1">Informasi lengkap merchant Anda</p>
    </div>
    {#if merchant && (merchant.status === 'step1' || merchant.status === 'step2' || merchant.status === 'step3' || merchant.status === 'step4' || merchant.status === 'step5')}
      <Button onclick={() => window.location.href = "/merchant/create"}>
        <Pencil class="w-4 h-4 mr-2" />
        Lanjutkan Pendaftaran
      </Button>
    {/if}
  </div>

  <!-- Loading State -->
  {#if isLoading}
    <Card>
      <CardContent class="py-10 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p class="text-muted-foreground mt-4">Memuat profil merchant...</p>
      </CardContent>
    </Card>
  {:else if error || !merchant}
    <!-- Error/Empty State -->
    <Card>
      <CardContent class="py-10 text-center">
        <AlertCircle class="w-12 h-12 text-destructive mx-auto mb-4" />
        <p class="text-destructive font-medium">{error || "Profil merchant tidak ditemukan"}</p>
        <div class="flex gap-4 justify-center mt-4">
          <Button variant="outline" onclick={loadMerchantProfile}>
            Coba Lagi
          </Button>
          <Button onclick={() => window.location.href = "/merchant/create"}>
            Daftar Merchant Baru
          </Button>
        </div>
      </CardContent>
    </Card>
  {:else}
    <!-- Merchant Profile -->
    <div class="grid gap-6 md:grid-cols-2">
      <!-- Basic Information -->
      <Card>
        <CardHeader>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Store class="w-5 h-5" />
              <CardTitle>Informasi Dasar</CardTitle>
            </div>
            {#if merchant.status}
              {@const { config } = getStatusBadge(merchant.status)}
              {@const Icon = config.icon}
              <Badge variant={config.variant} class={`${config.color}`}>
                <Icon class="w-3 h-3" />
                {config.label}
              </Badge>
            {/if}
          </div>
          <CardDescription>Informasi utama merchant</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div>
            <p class="text-sm font-medium text-muted-foreground">Nama Merchant</p>
            <p class="text-lg font-semibold">{merchant.store_name}</p>
          </div>
          <Separator />
          <div>
            <p class="text-sm font-medium text-muted-foreground">Kategori</p>
            <p class="text-base">{getCategoryName(merchant.category_id)} (ID: {merchant.category_id})</p>
          </div>
          <Separator />
          <div>
            <p class="text-sm font-medium text-muted-foreground">Alamat</p>
            <div class="flex items-start gap-2 mt-1">
              <MapPin class="w-4 h-4 text-muted-foreground mt-1" />
              <p class="text-base">{merchant.address}</p>
            </div>
          </div>
          {#if merchant.latitude && merchant.longitude}
            <div>
              <p class="text-sm font-medium text-muted-foreground">Koordinat</p>
              <p class="text-sm font-mono">Lat: {merchant.latitude}, Long: {merchant.longitude}</p>
            </div>
          {/if}
        </CardContent>
      </Card>

      <!-- Contact Information -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Phone class="w-5 h-5" />
            Informasi Kontak
          </CardTitle>
          <CardDescription>Detail kontak merchant</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div>
            <p class="text-sm font-medium text-muted-foreground">Nomor Telepon</p>
            <div class="flex items-center gap-2 mt-1">
              <Phone class="w-4 h-4 text-muted-foreground" />
              <p class="text-base">{merchant.contact_phone}</p>
            </div>
          </div>
          <Separator />
          <div>
            <p class="text-sm font-medium text-muted-foreground">Area Kerja</p>
            <p class="text-base">{merchant.work_area_name || "-"} ({merchant.work_area_id || "N/A"})</p>
          </div>
        </CardContent>
      </Card>

      <!-- Operation Hours -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Clock class="w-5 h-5" />
            Jam Operasional
          </CardTitle>
          <CardDescription>Jam buka merchant</CardDescription>
        </CardHeader>
        <CardContent>
          {#if merchant.operation_hours && merchant.operation_hours.length > 0}
            <div class="space-y-2">
              {#each merchant.operation_hours as op}
                <div class="flex justify-between items-center py-2 border-b last:border-0">
                  <span class="font-medium">{op.day}</span>
                  <span class="text-sm text-muted-foreground">
                    {op.open} - {op.close}
                  </span>
                </div>
              {/each}
            </div>
          {:else}
            <p class="text-muted-foreground text-sm">Jam operasional belum diisi</p>
          {/if}
        </CardContent>
      </Card>

      <!-- Bank Account -->
      <Card>
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <CreditCard class="w-5 h-5" />
            Informasi Rekening
          </CardTitle>
          <CardDescription>Detail rekening bank</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div>
            <p class="text-sm font-medium text-muted-foreground">Bank</p>
            <p class="text-base font-semibold">{merchant.bank_code || "-"}</p>
          </div>
          <Separator />
          <div>
            <p class="text-sm font-medium text-muted-foreground">Nomor Rekening</p>
            <p class="text-base font-mono">{merchant.account_number || "-"}</p>
          </div>
          <Separator />
          <div>
            <p class="text-sm font-medium text-muted-foreground">Pemilik Rekening</p>
            <p class="text-base">{merchant.account_holder_name || "-"}</p>
          </div>
        </CardContent>
      </Card>

      <!-- Documents -->
      <Card class="md:col-span-2">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <FileText class="w-5 h-5" />
            Dokumen
          </CardTitle>
          <CardDescription>Dokumen verifikasi merchant</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="space-y-2">
              <p class="text-sm font-medium">NIK</p>
              <p class="text-base font-mono">{merchant.id_card_number || "-"}</p>
            </div>
            <div class="space-y-2">
              <p class="text-sm font-medium">Foto KTP</p>
              {#if merchant.id_card_image_url}
                <a href={merchant.id_card_image_url} target="_blank" class="text-sm text-primary hover:underline flex items-center gap-1">
                  <Image class="w-4 h-4" />
                  Lihat Foto
                </a>
              {:else}
                <p class="text-sm text-muted-foreground">Belum diupload</p>
              {/if}
            </div>
            <div class="space-y-2">
              <p class="text-sm font-medium">Foto Selfie</p>
              {#if merchant.selfie_image_url}
                <a href={merchant.selfie_image_url} target="_blank" class="text-sm text-primary hover:underline flex items-center gap-1">
                  <Image class="w-4 h-4" />
                  Lihat Foto
                </a>
              {:else}
                <p class="text-sm text-muted-foreground">Belum diupload</p>
              {/if}
            </div>
            <div class="space-y-2">
              <p class="text-sm font-medium">Foto Depan Toko</p>
              {#if merchant.store_front_image_url}
                <a href={merchant.store_front_image_url} target="_blank" class="text-sm text-primary hover:underline flex items-center gap-1">
                  <Image class="w-4 h-4" />
                  Lihat Foto
                </a>
              {:else}
                <p class="text-sm text-muted-foreground">Belum diupload</p>
              {/if}
            </div>
            <div class="space-y-2">
              <p class="text-sm font-medium">Foto Dalam Toko</p>
              {#if merchant.store_inside_image_url}
                <a href={merchant.store_inside_image_url} target="_blank" class="text-sm text-primary hover:underline flex items-center gap-1">
                  <Image class="w-4 h-4" />
                  Lihat Foto
                </a>
              {:else}
                <p class="text-sm text-muted-foreground">Belum diupload</p>
              {/if}
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Reject Notes (if rejected) -->
      {#if merchant.status === "rejected" && merchant.reject_notes && merchant.reject_notes.length > 0}
        <Card class="md:col-span-2 border-destructive">
          <CardHeader>
            <CardTitle class="flex items-center gap-2 text-destructive">
              <XCircle class="w-5 h-5" />
              Alasan Penolakan
            </CardTitle>
            <CardDescription>Alasan merchant ditolak</CardDescription>
          </CardHeader>
          <CardContent>
            <ul class="list-disc list-inside space-y-2">
              {#each merchant.reject_notes as note}
                <li class="text-destructive">{note}</li>
              {/each}
            </ul>
            <div class="mt-4">
              <Button onclick={() => window.location.href = "/merchant/create"}>
                Perbaiki dan Daftar Ulang
              </Button>
            </div>
          </CardContent>
        </Card>
      {/if}

      <!-- Metadata -->
      <Card class="md:col-span-2">
        <CardHeader>
          <CardTitle class="flex items-center gap-2">
            <Calendar class="w-5 h-5" />
            Metadata
          </CardTitle>
          <CardDescription>Informasi sistem</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <p class="text-sm font-medium text-muted-foreground">UUID</p>
              <p class="text-xs font-mono mt-1">{merchant.uuid}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Dibuat Pada</p>
              <p class="text-sm mt-1">{formatDate(merchant.created_at)}</p>
            </div>
            <div>
              <p class="text-sm font-medium text-muted-foreground">Rating</p>
              <p class="text-sm mt-1">
                ⭐ {merchant.avg_rating?.toFixed(1) || "0.0"} ({merchant.total_ratings} ulasan)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-4">
      <Button variant="outline" onclick={() => window.location.href = "/merchant/dashboard"}>
        Kembali ke Dashboard
      </Button>
      {#if merchant.status === 'approved'}
        <Button onclick={() => window.location.href = "/merchant/asset"}>
          <Store class="w-4 h-4 mr-2" />
          Lihat Asset
        </Button>
      {/if}
    </div>
  {/if}
</div>
