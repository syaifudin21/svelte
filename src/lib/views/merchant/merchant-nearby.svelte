<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import * as Card from "$lib/components/ui/card";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Button } from "$lib/components/ui/button";
  import { Badge } from "$lib/components/ui/badge";
  import { merchantService } from "$lib/services/merchant.service";
  import type { NearbyMerchant } from "$lib/types/merchant";
  import {
    MapPin,
    Search,
    Navigation,
    Store,
    Star,
    RefreshCw,
  } from "lucide-svelte";
  import { toast } from "svelte-sonner";
  import { browser } from "$app/environment";
  import MerchantNearbyMap from "$lib/components/merchant-nearby-map.svelte";

  let lat = $state(-6.2088);
  let long = $state(106.8456);
  let radius = $state(5);
  let categoryId = $state<number | undefined>(undefined);

  let merchants = $state<NearbyMerchant[]>([]);
  let loading = $state(false);
  let mapComponent: any;

  async function searchNearby() {
    loading = true;
    try {
      const res = await merchantService.getNearbyMerchants({
        lat,
        long: long,
        radius,
        category_id: categoryId,
        status: "approved",
      });

      console.log("Nearby Search Response:", res);

      // Robust data parsing
      if (res && res.data) {
        console.log("Parsing from res.data:", res.data);
        if (Array.isArray(res.data)) {
          merchants = res.data;
        } else if (res.data.items && Array.isArray(res.data.items)) {
          merchants = res.data.items;
        } else {
          console.warn("res.data is not an array or items array");
          merchants = [];
        }
      } else if (Array.isArray(res)) {
        console.log("Parsing direct array:", res);
        merchants = res;
      } else {
        console.warn("Unknown response structure:", res);
        merchants = [];
      }
      console.log("Final merchants count:", merchants.length);
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Gagal mencari merchant terdekat",
      );
    } finally {
      loading = false;
    }
  }

  function focusMerchant(m: NearbyMerchant) {
    if (mapComponent) {
      mapComponent.openMerchantPopup(m);
    }
  }

  function handleMapClick(newLat: number, newLong: number) {
    lat = newLat;
    long = newLong;
  }

  function getCurrentLocation() {
    if (browser && "geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          lat = position.coords.latitude;
          long = position.coords.longitude;
          if (mapComponent) {
            mapComponent.setView(lat, long, 15);
          }
          searchNearby();
        },
        (error) => {
          toast.error("Gagal mendapatkan lokasi: " + error.message);
        },
      );
    } else {
      toast.error("Geolocation tidak didukung di browser ini.");
    }
  }

  onMount(() => {
    searchNearby();
  });

  onDestroy(() => {
    // cleanup in component
  });
</script>

<div class="flex flex-col gap-6 p-6">
  <div class="flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold tracking-tight">Merchant Nearby</h1>
      <p class="text-muted-foreground">
        Temukan toko dalam jangkauan radar Anda.
      </p>
    </div>
    <div class="flex items-center gap-2">
      <Badge variant="outline" class="px-3 py-1">
        <MapPin class="mr-1 h-3 w-3" />
        {lat.toFixed(4)}, {long.toFixed(4)}
      </Badge>
    </div>
  </div>

  <div class="grid gap-6 lg:grid-cols-4">
    <!-- Filters & List -->
    <div class="lg:col-span-1 space-y-6 flex flex-col h-[700px]">
      <Card.Root>
        <Card.Header class="pb-3">
          <Card.Title class="text-lg">Konfigurasi Radar</Card.Title>
        </Card.Header>
        <Card.Content class="space-y-4">
          <div class="grid grid-cols-2 gap-2">
            <div class="space-y-1">
              <Label
                class="text-[10px] uppercase font-bold text-muted-foreground"
                >LAT</Label
              >
              <Input
                type="number"
                step="0.0001"
                bind:value={lat}
                class="h-8 text-xs"
              />
            </div>
            <div class="space-y-1">
              <Label
                class="text-[10px] uppercase font-bold text-muted-foreground"
                >LONG</Label
              >
              <Input
                type="number"
                step="0.0001"
                bind:value={long}
                class="h-8 text-xs"
              />
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between">
              <Label
                class="text-[10px] uppercase font-bold text-muted-foreground"
                >RADIUS (KM)</Label
              >
              <span class="text-xs font-bold text-primary">{radius} km</span>
            </div>
            <Input
              type="range"
              min="0.5"
              max="50"
              step="0.5"
              bind:value={radius}
            />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              class="gap-1 text-xs"
              onclick={getCurrentLocation}
            >
              <Navigation class="h-3 w-3" />
              GPS
            </Button>
            <Button
              size="sm"
              class="gap-1 text-xs"
              onclick={searchNearby}
              disabled={loading}
            >
              {#if loading}
                <RefreshCw class="h-3 w-3 animate-spin" />
              {:else}
                <Search class="h-3 w-3" />
              {/if}
              Update
            </Button>
          </div>
        </Card.Content>
      </Card.Root>

      <!-- Scrollable Results -->
      <div
        class="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-muted"
      >
        {#if loading}
          <div class="flex h-32 items-center justify-center">
            <RefreshCw
              class="h-6 w-6 animate-spin text-muted-foreground opacity-50"
            />
          </div>
        {:else if merchants.length > 0}
          {#each merchants as merchant}
            <button
              onclick={() => focusMerchant(merchant)}
              class="w-full text-left group rounded-xl border bg-card p-3 hover:border-primary hover:shadow-md transition-all duration-200"
            >
              <div class="flex justify-between items-start mb-2">
                <div
                  class="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"
                >
                  <Store class="h-4 w-4" />
                </div>
                {#if merchant.avg_rating}
                  <Badge
                    variant="secondary"
                    class="h-5 text-[10px] gap-1 px-1.5 font-bold"
                  >
                    <Star class="h-2.5 w-2.5 fill-yellow-500 text-yellow-500" />
                    {merchant.avg_rating}
                  </Badge>
                {/if}
              </div>
              <h3
                class="font-bold text-sm leading-tight group-hover:text-primary"
              >
                {merchant.store_name}
              </h3>
              <p
                class="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider"
              >
                {merchant.category_name}
              </p>
              <div
                class="mt-2 text-[10px] flex items-center gap-1 text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity"
              >
                LIHAT PETA →
              </div>
            </button>
          {/each}
        {:else}
          <div class="text-center py-10 text-muted-foreground italic text-sm">
            Radar kosong. Coba perluas radius.
          </div>
        {/if}
      </div>
    </div>

    <!-- Map Area (Primary) -->
    <Card.Root class="lg:col-span-3 overflow-hidden border-2 shadow-2xl">
      <Card.Content class="p-0 h-[700px] relative">
        <MerchantNearbyMap
          bind:this={mapComponent}
          centerLat={lat}
          centerLong={long}
          {radius}
          {merchants}
          onMapClick={handleMapClick}
        />

        <!-- Map Overlay Info -->
        <div class="absolute bottom-4 left-4 z-[500] pointer-events-none">
          <div
            class="bg-background/90 backdrop-blur-md p-3 rounded-lg border shadow-lg space-y-1"
          >
            <div class="flex items-center gap-2">
              <div class="h-3 w-3 rounded-full bg-primary animate-pulse"></div>
              <span class="text-xs font-bold"
                >Ditemukan {merchants.length} Merchant</span
              >
            </div>
            <p class="text-[10px] text-muted-foreground">
              Klik di peta untuk mengubah titik pusat radar
            </p>
          </div>
        </div>
      </Card.Content>
    </Card.Root>
  </div>
</div>

<style>
  :global(.leaflet-container) {
    width: 100%;
    height: 100%;
  }

  /* Custom scrollbar for results */
  .scrollbar-thin::-webkit-scrollbar {
    width: 4px;
  }
  .scrollbar-thin::-webkit-scrollbar-thumb {
    background: hsl(var(--muted-foreground) / 0.2);
    border-radius: 10px;
  }
</style>
