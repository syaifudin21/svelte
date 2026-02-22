<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { merchantRegistrationStore } from "$lib/stores/merchant-registration.svelte";
  import Step2Profile from "$lib/components/merchant-registration/step-2-profile.svelte";
  import { RegistrationHeader, RegistrationStepper, RegistrationError, RegistrationNavigation } from "$lib/views/merchant-registration";
  import { Check } from "lucide-svelte";

  let isChecking = $state(true);

  onMount(async () => {
    // Check if step 1 is completed (must have merchant_uuid)
    if (!merchantRegistrationStore.data.merchant_uuid) {
      // Try to load from waiting API
      try {
        await merchantRegistrationStore.checkWaitingProfile();
      } catch (err) {
        // No waiting profile, redirect to step 1
        goto('/merchant/create');
        return;
      }
    } else {
      // Already have merchant_uuid, load fresh data from API
      try {
        await merchantRegistrationStore.loadStepData(2);
      } catch (err) {
        console.error('Failed to load step 2 data:', err);
      }
    }
    
    // If still no merchant_uuid, redirect to step 1
    if (!merchantRegistrationStore.data.merchant_uuid) {
      goto('/merchant/create');
      return;
    }
    
    isChecking = false;
  });
</script>

<div class="min-h-screen bg-background">
  <div class="container mx-auto py-8 max-w-4xl">
    <RegistrationHeader />

    {#if isChecking || merchantRegistrationStore.isLoading}
      <div class="flex items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span class="ml-3 text-muted-foreground">Memuat data...</span>
      </div>
    {:else if merchantRegistrationStore.isSubmitted}
      <div class="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check class="w-8 h-8 text-green-600" />
        </div>
        <h2 class="text-2xl font-bold text-green-800 mb-2">Pendaftaran Berhasil Dikirim!</h2>
        <p class="text-green-700 mb-6">Terima kasih telah mendaftar.</p>
      </div>
    {:else}
      <RegistrationStepper currentStep={2} totalSteps={6} />
      <RegistrationError error={merchantRegistrationStore.error} />

      <div class="mb-6">
        <Step2Profile
          onSubmit={merchantRegistrationStore.submitStep2}
          isLoading={merchantRegistrationStore.isLoading}
        />
      </div>

      <RegistrationNavigation
        onBack={() => goto('/merchant/create')}
        disabled={merchantRegistrationStore.isLoading}
      />
    {/if}
  </div>
</div>
