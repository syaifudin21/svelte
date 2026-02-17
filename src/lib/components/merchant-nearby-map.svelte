<script lang="ts">
  import { onMount, onDestroy, untrack } from "svelte";
  import L from "leaflet";
  import "leaflet/dist/leaflet.css";
  import type { NearbyMerchant } from "$lib/types/merchant";

  interface Props {
    centerLat: number;
    centerLong: number;
    radius: number;
    merchants: NearbyMerchant[];
    onMapClick?: (lat: number, lng: number) => void;
  }

  /* eslint-disable svelte/no-unused-svelte-ignore */
  let { centerLat, centerLong, radius, merchants, onMapClick }: Props =
    $props();

  let mapElement: HTMLElement;
  let map: L.Map | undefined;
  let markers: L.Marker[] = [];
  let radiusCircle: L.Circle | undefined;
  let centerMarker: L.CircleMarker | undefined;

  // React to changes in props using $effect
  $effect(() => {
    // Dependencies
    const _lat = centerLat;
    const _lng = centerLong;
    const _rad = radius;
    const _merchants = merchants;

    if (map) {
      untrack(() => {
        if (centerMarker) centerMarker.setLatLng([centerLat, centerLong]);
        updateRadiusCircle();
        updateMarkers();
      });
    }
  });

  function updateRadiusCircle() {
    if (!map) return;
    if (radiusCircle) radiusCircle.remove();

    radiusCircle = L.circle([centerLat, centerLong], {
      radius: radius * 1000,
      color: "#3b82f6",
      fillColor: "#3b82f6",
      fillOpacity: 0.1,
      weight: 1,
      dashArray: "5, 5",
    }).addTo(map);
  }

  function updateMarkers() {
    if (!map) return;

    // Clear existing markers
    markers.forEach((m) => m.remove());
    markers = [];

    // Add new markers
    merchants.forEach((m) => {
      if (typeof m.latitude === "number" && typeof m.longitude === "number") {
        const marker = L.marker([m.latitude, m.longitude]).addTo(map!);

        const popupContent = `
          <div class="p-2 min-w-[150px]">
            <h3 class="font-bold text-sm mb-1">${m.store_name}</h3>
            <div class="flex items-center gap-1 text-xs text-muted-foreground mb-2">
              <span class="bg-primary/10 text-primary px-1.5 py-0.5 rounded">${m.category_name}</span>
              ${m.avg_rating ? `<span>⭐ ${m.avg_rating}</span>` : ""}
            </div>
            <a href="/merchant/${m.uuid}" class="text-[10px] text-blue-600 hover:underline block font-medium">
              Lihat Detail →
            </a>
          </div>
        `;

        marker.bindPopup(popupContent);
        markers.push(marker);
      }
    });

    if (markers.length > 0) {
      const group = L.featureGroup(markers);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }

  export function setView(lat: number, lng: number, zoom = 13) {
    if (map) map.setView([lat, lng], zoom);
  }

  export function openMerchantPopup(m: NearbyMerchant) {
    if (!map) return;
    map.setView([m.latitude, m.longitude], 17);
    const marker = markers.find((marker) => {
      const pos = marker.getLatLng();
      return pos.lat === m.latitude && pos.lng === m.longitude;
    });
    if (marker) marker.openPopup();
  }

  onMount(() => {
    if (!mapElement) return;

    // Fix for missing default marker icons in build - DO THIS FIRST
    const DefaultIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    map = L.map(mapElement).setView([centerLat, centerLong], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    centerMarker = L.circleMarker([centerLat, centerLong], {
      color: "#3b82f6",
      fillColor: "#3b82f6",
      fillOpacity: 0.5,
      radius: 8,
    })
      .addTo(map)
      .bindPopup("Lokasi Pencarian");

    updateRadiusCircle();
    updateMarkers();

    map.on("click", (e) => {
      if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
    });

    // Force recalibration of map size
    setTimeout(() => {
      if (map) map.invalidateSize();
    }, 100);
  });

  onDestroy(() => {
    if (map) {
      map.remove();
      map = undefined;
    }
  });
</script>

<div bind:this={mapElement} class="h-full w-full rounded-lg bg-slate-100"></div>

<style>
  :global(.leaflet-container) {
    z-index: 1;
    width: 100%;
    height: 100%;
  }
</style>
