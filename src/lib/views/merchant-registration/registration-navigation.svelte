<script lang="ts">
  import { uiStore } from "$lib/stores/ui.svelte";
  import { Button } from "$lib/components/ui/button";

  export let onBack: () => void;
  export let disabled: boolean = false;
</script>

<div class="flex justify-between">
  <Button
    variant="outline"
    onclick={onBack}
    disabled={disabled}
  >
    ← {uiStore.t("merchant_registration.navigation.back")}
  </Button>
  <div></div>
</div>
