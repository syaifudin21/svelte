<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import type L from "leaflet";

  interface Props {
    lat: number;
    lng: number;
    storeName: string;
  }

  let { lat, lng, storeName }: Props = $props();
  let mapElement: HTMLElement;
  let map: L.Map;

  onMount(async () => {
    const L = await import("leaflet");
    await import("leaflet/dist/leaflet.css");

    map = L.map(mapElement).setView([lat, lng], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Fix for missing default marker icons in build
    const DefaultIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    L.marker([lat, lng]).addTo(map).bindPopup(storeName).openPopup();
  });

  onDestroy(() => {
    if (map) {
      map.remove();
    }
  });
</script>

<div
  bind:this={mapElement}
  class="h-full w-full rounded-lg border bg-muted"
></div>

<style>
  /* Ensure leaflet container doesn't overflow or have weird sizing */
  :global(.leaflet-container) {
    z-index: 1;
    width: 100%;
    height: 100%;
  }
</style>
