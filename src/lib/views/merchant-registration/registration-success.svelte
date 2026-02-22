<script lang="ts">
  import { uiStore } from "$lib/stores/ui.svelte";
  import { Check } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button";

  function goToDashboard() {
    window.location.href = "/merchant/dashboard";
  }
</script>

<div class="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
  <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
    <Check class="w-8 h-8 text-green-600" />
  </div>
  <h2 class="text-2xl font-bold text-green-800 mb-2">
    {uiStore.t("merchant_registration.success.title")}
  </h2>
  <p class="text-green-700 mb-6">
    {uiStore.t("merchant_registration.success.description")}
  </p>
  <Button onclick={goToDashboard}>
    {uiStore.t("merchant_registration.success.back_to_dashboard")}
  </Button>
</div>
