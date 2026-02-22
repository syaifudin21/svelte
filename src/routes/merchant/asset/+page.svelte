<script lang="ts">
  import { onMount } from "svelte";
  import { merchantService } from "$lib/services/merchant.service";
  import type { MerchantProfile } from "$lib/types/merchant";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { Store, Plus, Eye, AlertCircle, CheckCircle, XCircle, Clock, Building2 } from "lucide-svelte";

  let merchants = $state<MerchantProfile[]>([]);
  let isLoading = $state(true);
  let error = $state<string | null>(null);

  onMount(async () => {
    await loadMerchants();
  });

  async function loadMerchants() {
    isLoading = true;
    error = null;
    try {
      const response = await merchantService.getCurrentMerchantProfile();
      merchants = Array.isArray(response.data.items) ? response.data.items : [response.data];
    } catch (err: any) {
      error = err.response?.data?.message || "Failed to load assets";
      console.error("Failed to load assets:", err);
    } finally {
      isLoading = false;
    }
  }

  function getStatusBadge(status: string) {
    const statusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string; icon: any }> = {
      submitted: { variant: "default", label: "Diajukan", icon: Clock },
      approved: { variant: "secondary", label: "Disetujui", icon: CheckCircle },
      rejected: { variant: "destructive", label: "Ditolak", icon: XCircle },
      step1: { variant: "outline", label: "Langkah 1", icon: AlertCircle },
      step2: { variant: "outline", label: "Langkah 2", icon: AlertCircle },
      step3: { variant: "outline", label: "Langkah 3", icon: AlertCircle },
      step4: { variant: "outline", label: "Langkah 4", icon: AlertCircle },
      step5: { variant: "outline", label: "Langkah 5", icon: AlertCircle },
    };

    const config = statusConfig[status] || { variant: "outline" as const, label: status, icon: AlertCircle };
    return { config };
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
      <h1 class="text-3xl font-bold tracking-tight">Asset Merchant</h1>
      <p class="text-muted-foreground mt-1">Kelola dan pantau asset merchant Anda</p>
    </div>
    <Button onclick={() => window.location.href = "/merchant/create"}>
      <Plus class="w-4 h-4 mr-2" />
      Tambah Asset Baru
    </Button>
  </div>

  <!-- Loading State -->
  {#if isLoading}
    <Card>
      <CardContent class="py-10 text-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p class="text-muted-foreground mt-4">Memuat asset...</p>
      </CardContent>
    </Card>
  {:else if error}
    <!-- Error State -->
    <Card>
      <CardContent class="py-10 text-center">
        <AlertCircle class="w-12 h-12 text-destructive mx-auto mb-4" />
        <p class="text-destructive font-medium">{error}</p>
        <Button variant="outline" class="mt-4" onclick={loadMerchants}>
          Coba Lagi
        </Button>
      </CardContent>
    </Card>
  {:else if merchants.length === 0}
    <!-- Empty State -->
    <Card>
      <CardContent class="py-10 text-center">
        <Building2 class="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 class="text-lg font-semibold mb-2">Belum Ada Asset</h3>
        <p class="text-muted-foreground mb-4">Mulai dengan menambahkan asset pertama Anda</p>
        <Button onclick={() => window.location.href = "/merchant/create"}>
          <Plus class="w-4 h-4 mr-2" />
          Tambah Asset Baru
        </Button>
      </CardContent>
    </Card>
  {:else}
    <!-- Asset List -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {#each merchants as merchant}
        <Card class="hover:shadow-lg transition-shadow cursor-pointer" onclick={() => window.location.href = `/asset/${merchant.uuid}`}>
          <CardHeader class="pb-3">
            <div class="flex items-start justify-between">
              <div class="space-y-1">
                <CardTitle class="text-lg">{merchant.store_name}</CardTitle>
                <CardDescription class="line-clamp-1">{merchant.address}</CardDescription>
              </div>
              {#if merchant.status}
                {@const { config } = getStatusBadge(merchant.status)}
                {@const Icon = config.icon}
                <Badge variant={config.variant} class="gap-1">
                  <Icon class="w-3 h-3" />
                  {config.label}
                </Badge>
              {/if}
            </div>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p class="text-muted-foreground">Kategori</p>
                <p class="font-medium">ID: {merchant.category_id}</p>
              </div>
              <div>
                <p class="text-muted-foreground">Area Kerja</p>
                <p class="font-medium truncate">{merchant.work_area_name || "-"}</p>
              </div>
            </div>

            {#if merchant.reject_notes && merchant.reject_notes.length > 0}
              <div class="bg-destructive/10 border border-destructive text-destructive px-3 py-2 rounded-md text-sm">
                <p class="font-semibold flex items-center gap-1 mb-1">
                  <XCircle class="w-3 h-3" />
                  Alasan Penolakan:
                </p>
                <ul class="list-disc list-inside space-y-1 text-xs">
                  {#each merchant.reject_notes as note}
                    <li>{note}</li>
                  {/each}
                </ul>
              </div>
            {/if}

            <div class="flex items-center justify-between pt-2 border-t">
              <p class="text-xs text-muted-foreground">
                Dibuat: {formatDate(merchant.created_at)}
              </p>
              <Button variant="ghost" size="sm" class="h-8 gap-1">
                <Eye class="w-3 h-3" />
                Detail
              </Button>
            </div>
          </CardContent>
        </Card>
      {/each}
    </div>
  {/if}

  <!-- Summary Stats -->
  {#if merchants.length > 0}
    <Card>
      <CardHeader>
        <CardTitle>Ringkasan Asset</CardTitle>
        <CardDescription>Statistik asset merchant Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="text-center p-4 bg-blue-50 rounded-lg">
            <p class="text-2xl font-bold text-blue-600">{merchants.length}</p>
            <p class="text-sm text-blue-700">Total</p>
          </div>
          <div class="text-center p-4 bg-green-50 rounded-lg">
            <p class="text-2xl font-bold text-green-600">
              {merchants.filter(m => m.status === "approved").length}
            </p>
            <p class="text-sm text-green-700">Disetujui</p>
          </div>
          <div class="text-center p-4 bg-yellow-50 rounded-lg">
            <p class="text-2xl font-bold text-yellow-600">
              {merchants.filter(m => m.status === "submitted" || ["step1", "step2", "step3", "step4", "step5"].includes(m.status)).length}
            </p>
            <p class="text-sm text-yellow-700">Proses</p>
          </div>
          <div class="text-center p-4 bg-red-50 rounded-lg">
            <p class="text-2xl font-bold text-red-600">
              {merchants.filter(m => m.status === "rejected").length}
            </p>
            <p class="text-sm text-red-700">Ditolak</p>
          </div>
        </div>
      </CardContent>
    </Card>
  {/if}
</div>
