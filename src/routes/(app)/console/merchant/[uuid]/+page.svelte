<script lang="ts">
  import MerchantDetail from "$lib/views/merchant/merchant-detail.svelte";
  import { page } from "$app/state";

  let uuid = $derived(page.params.uuid);
</script>

{#if uuid}
  <MerchantDetail {uuid} />
{/if}
