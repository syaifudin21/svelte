<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import "leaflet/dist/leaflet.css";

  let { 
    latitude = $bindable<number | null>(null), 
    longitude = $bindable<number | null>(null), 
    disabled = false 
  }: { 
    latitude?: number | null; 
    longitude?: number | null; 
    disabled?: boolean;
  } = $props();

  let mapContainer: HTMLDivElement;
  let map: any = null;
  let marker: any = null;
  let L: any = null;
  let isInitialized = $state(false);

  onMount(async () => {
    // Dynamic import for client-side only
    L = await import("leaflet");

    const initialLat = latitude || -6.2088; // Jakarta
    const initialLng = longitude || 106.8456;

    map = L.map(mapContainer, {
      zoomControl: !disabled,
      scrollWheelZoom: false,
      doubleClickZoom: false,
    }).setView([initialLat, initialLng], 13);

    // Add OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add marker if coordinates exist
    if (latitude && longitude) {
      marker = L.marker([latitude, longitude], { draggable: !disabled }).addTo(
        map
      );
    }

    // Handle map click
    if (!disabled) {
      map.on("click", (e: any) => {
        updateLocation(e.latlng.lat, e.latlng.lng);
      });
    }
    
    isInitialized = true;
  });

  function updateLocation(lat: number, lng: number) {
    console.log('[LocationMap] Updating location:', lat, lng);
    latitude = lat;
    longitude = lng;
    
    // Update marker
    if (marker) {
      marker.setLatLng([lat, lng]);
    } else if (map) {
      marker = L.marker([lat, lng], { draggable: !disabled }).addTo(map);
    }
  }

  // Update marker when props change
  $effect(() => {
    if (isInitialized && map && latitude && longitude) {
      if (marker) {
        marker.setLatLng([latitude, longitude]);
      }
      map.setView([latitude, longitude], 13);
    }
  });

  onDestroy(() => {
    if (map) {
      map.remove();
      map = null;
    }
  });
</script>

<div class="relative">
  <div
    bind:this={mapContainer}
    class="w-full h-[300px] rounded-md border {disabled ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}"
  ></div>
  {#if !disabled}
    <p class="text-xs text-muted-foreground mt-2 text-center">
      Klik pada peta untuk memilih lokasi, atau geser marker
    </p>
  {/if}
</div>
