<script lang="ts">
  import { page } from "$app/stores";
  import DriverDetail from "$lib/views/driver/driver-detail.svelte";
  import { uiStore } from "$lib/stores/ui.svelte";

  let uuid = $derived($page.params.uuid ?? "");

  $effect(() => {
    uiStore.setBreadcrumbs([
      { label: uiStore.t("sidebar.dashboard"), href: "/dashboard" },
      { label: uiStore.t("sidebar.driver"), href: "/driver" },
      { label: "Driver Detail" },
    ]);
  });
</script>

<DriverDetail {uuid} />
