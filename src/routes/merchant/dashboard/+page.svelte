<script lang="ts">
  import { onMount } from "svelte";
  import { merchantService } from "$lib/services/merchant.service";
  import type { MerchantProfile } from "$lib/types/merchant";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { TrendingUp, Users, Store, DollarSign, Plus, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-svelte";

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
      if ("items" in response.data && Array.isArray(response.data.items)) {
        merchants = response.data.items;
      } else if (Array.isArray(response.data)) {
        merchants = response.data;
      } else if (response.data && typeof response.data === "object" && "uuid" in response.data) {
        merchants = [response.data as MerchantProfile];
      } else {
        merchants = [];
      }
    } catch (err: any) {
      error = err.response?.data?.message || "Failed to load merchants";
      console.error("Failed to load merchants:", err);
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

  // Stats calculations
  let totalMerchants = $derived(merchants.length);
  let approvedCount = $derived(merchants.filter(m => m.status === "approved").length);
  let pendingCount = $derived(merchants.filter(m => m.status === "submitted" || ["step1", "step2", "step3", "step4", "step5"].includes(m.status)).length);
  let rejectedCount = $derived(merchants.filter(m => m.status === "rejected").length);
</script>

<div class="space-y-6">
  <!-- Header -->
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
      <p class="text-muted-foreground mt-1">Overview dan statistik merchant Anda</p>
    </div>
    <Button onclick={() => window.location.href = "/merchant/create"}>
      <Plus class="w-4 h-4 mr-2" />
      Daftar Merchant Baru
    </Button>
  </div>

  <!-- Stats Cards -->
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    <!-- Total Card -->
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Total Merchant</CardTitle>
        <Store class="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">{totalMerchants}</div>
        <p class="text-xs text-muted-foreground">Semua merchant terdaftar</p>
      </CardContent>
    </Card>

    <!-- Approved Card -->
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Disetujui</CardTitle>
        <CheckCircle class="h-4 w-4 text-green-600" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold text-green-600">{approvedCount}</div>
        <p class="text-xs text-muted-foreground">Merchant aktif</p>
      </CardContent>
    </Card>

    <!-- Pending Card -->
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Dalam Proses</CardTitle>
        <Clock class="h-4 w-4 text-yellow-600" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold text-yellow-600">{pendingCount}</div>
        <p class="text-xs text-muted-foreground">Menunggu verifikasi</p>
      </CardContent>
    </Card>

    <!-- Rejected Card -->
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Ditolak</CardTitle>
        <XCircle class="h-4 w-4 text-red-600" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold text-red-600">{rejectedCount}</div>
        <p class="text-xs text-muted-foreground">Perlu perbaikan</p>
      </CardContent>
    </Card>
  </div>

  <!-- Main Content Grid -->
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
    <!-- Recent Merchants List -->
    <Card class="col-span-full lg:col-span-4">
      <CardHeader>
        <CardTitle>Merchant Terbaru</CardTitle>
        <CardDescription>Daftar merchant yang baru ditambahkan</CardDescription>
      </CardHeader>
      <CardContent>
        {#if merchants.length > 0}
          <div class="space-y-4">
            {#each merchants.slice(0, 5) as merchant}
              <div class="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" onclick={() => window.location.href = `/asset/${merchant.uuid}`}>
                <div class="space-y-1">
                  <p class="font-medium">{merchant.store_name}</p>
                  <p class="text-xs text-muted-foreground line-clamp-1">{merchant.address}</p>
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
            {/each}
          </div>
        {:else}
          <div class="text-center py-8 text-muted-foreground">
            <Store class="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Belum ada merchant</p>
          </div>
        {/if}
      </CardContent>
    </Card>

    <!-- Quick Actions & Info -->
    <Card class="col-span-full lg:col-span-3">
      <CardHeader>
        <CardTitle>Aksi Cepat</CardTitle>
        <CardDescription>Menu cepat untuk mengelola merchant</CardDescription>
      </CardHeader>
      <CardContent>
        <div class="space-y-3">
          <Button class="w-full justify-start" variant="outline" onclick={() => window.location.href = "/merchant/create"}>
            <Plus class="w-4 h-4 mr-2" />
            Daftar Merchant Baru
          </Button>
          <Button class="w-full justify-start" variant="outline" onclick={() => window.location.href = "/merchant/asset"}>
            <Store class="w-4 h-4 mr-2" />
            Lihat Semua Asset
          </Button>
          <Button class="w-full justify-start" variant="outline" onclick={() => window.location.href = "/merchant/setting"}>
            <TrendingUp class="w-4 h-4 mr-2" />
            Pengaturan
          </Button>
          <Button class="w-full justify-start" variant="outline" onclick={() => window.location.href = "/merchant/help"}>
            <Users class="w-4 h-4 mr-2" />
            Bantuan
          </Button>
        </div>

        <div class="mt-6 p-4 bg-muted rounded-lg">
          <h4 class="font-semibold mb-2">Tips:</h4>
          <ul class="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Pastikan semua data merchant lengkap</li>
            <li>Upload dokumen dengan kualitas baik</li>
            <li>Proses verifikasi memakan waktu 3x24 jam</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  </div>
</div>
