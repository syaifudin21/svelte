<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { merchantRegistrationStore } from "$lib/stores/merchant-registration.svelte";
  import Step4BankAccount from "$lib/components/merchant-registration/step-4-bank-account.svelte";
  import { RegistrationHeader, RegistrationStepper, RegistrationError, RegistrationNavigation } from "$lib/views/merchant-registration";
  import { Check } from "lucide-svelte";

  let isChecking = $state(true);

  onMount(async () => {
    if (!merchantRegistrationStore.data.merchant_uuid) {
      try {
        await merchantRegistrationStore.checkWaitingProfile();
      } catch (err) {
        goto('/merchant/create');
        return;
      }
    } else {
      try {
        await merchantRegistrationStore.loadStepData(4);
      } catch (err) {
        console.error('Failed to load step 4 data:', err);
      }
    }
    
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
      <RegistrationStepper currentStep={4} totalSteps={6} />
      <RegistrationError error={merchantRegistrationStore.error} />

      <div class="mb-6">
        <Step4BankAccount
          onSubmit={merchantRegistrationStore.submitStep4}
          isLoading={merchantRegistrationStore.isLoading}
        />
      </div>

      <RegistrationNavigation
        onBack={() => goto('/merchant/create/step-3')}
        disabled={merchantRegistrationStore.isLoading}
      />
    {/if}
  </div>
</div>
