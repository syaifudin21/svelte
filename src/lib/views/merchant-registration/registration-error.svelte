<script lang="ts">
  import { uiStore } from "$lib/stores/ui.svelte";

  export let error: string | null = null;
</script>

{#if error && !error.includes("PENDING_REGISTRATION")}
  <div class="bg-destructive/15 border border-destructive text-destructive px-4 py-3 rounded-md mb-6">
    <p class="text-sm font-medium">{error}</p>
    {#if error.includes("unapproved")}
      <p class="text-sm mt-2">
        {uiStore.t("merchant_registration.pending_dialog.description")}
      </p>
    {/if}
  </div>
{/if}
