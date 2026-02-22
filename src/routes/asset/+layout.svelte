<script lang="ts">
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import MerchantSidebar from "$lib/components/merchant-sidebar.svelte";
  import SiteHeader from "$lib/components/site-header.svelte";

  let { children } = $props();
</script>

<Sidebar.Provider
  style="--sidebar-width: calc(var(--spacing) * 72); --header-height: calc(var(--spacing) * 12);"
>
  <MerchantSidebar variant="inset" />
  <Sidebar.Inset>
    <SiteHeader />
    <div class="m-6">
      {@render children()}
    </div>
  </Sidebar.Inset>
</Sidebar.Provider>
