<script lang="ts">
  import { uiStore } from "$lib/stores/ui.svelte";
  import { Check } from "lucide-svelte";
</script>

<div class="mb-8">
  <h1 class="text-3xl font-bold tracking-tight">{uiStore.t("merchant_registration.title")}</h1>
  <p class="text-muted-foreground mt-1">{uiStore.t("merchant_registration.subtitle")}</p>
</div>
