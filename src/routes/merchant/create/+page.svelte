<script lang="ts">
  import { onMount } from "svelte";
  import { merchantRegistrationStore } from "$lib/stores/merchant-registration.svelte";
  import Step1Register from "$lib/components/merchant-registration/step-1-register.svelte";
  import Step2Profile from "$lib/components/merchant-registration/step-2-profile.svelte";
  import Step3Documents from "$lib/components/merchant-registration/step-3-documents.svelte";
  import Step4BankAccount from "$lib/components/merchant-registration/step-4-bank-account.svelte";
  import Step5MenuItems from "$lib/components/merchant-registration/step-5-menu-items.svelte";
  import Step6Submit from "$lib/components/merchant-registration/step-6-submit.svelte";
  import {
    RegistrationHeader,
    RegistrationStepper,
    RegistrationSuccess,
    RegistrationError,
    RegistrationNavigation,
    PendingDialog,
    SubmittedDialog,
  } from "$lib/views/merchant-registration";

  let isChecking = $state(true);

  onMount(async () => {
    // Check waiting profile on page load
    try {
      await merchantRegistrationStore.checkWaitingProfile();
    } catch (err) {
      // No waiting profile, start fresh
      console.log('[Page] No waiting profile found, starting fresh');
    }
    isChecking = false;
  });
</script>

<div class="min-h-screen bg-background">
  <div class="container mx-auto py-8 max-w-4xl">
    <!-- Header -->
    <RegistrationHeader />

    <!-- Loading State -->
    {#if isChecking || merchantRegistrationStore.isLoading}
      <div class="flex items-center justify-center py-12">
        <div
          class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"
        ></div>
        <span class="ml-3 text-muted-foreground">Memuat data...</span>
      </div>
    {:else if merchantRegistrationStore.isSubmitted}
      <!-- Success State -->
      <RegistrationSuccess />
    {:else}
      <!-- Stepper -->
      <RegistrationStepper
        currentStep={merchantRegistrationStore.currentStep}
        totalSteps={6}
      />

      <!-- Error Alert -->
      <RegistrationError error={merchantRegistrationStore.error} />

      <!-- Step Content -->
      <div class="mb-6">
        {#if merchantRegistrationStore.currentStep === 1}
          <Step1Register
            onSubmit={async (formData) => {
              await merchantRegistrationStore.submitStep1(formData);
            }}
            isLoading={merchantRegistrationStore.isLoading}
          />
        {:else if merchantRegistrationStore.currentStep === 2}
          <Step2Profile
            onSubmit={async (formData) => {
              await merchantRegistrationStore.submitStep2(formData);
            }}
            isLoading={merchantRegistrationStore.isLoading}
          />
        {:else if merchantRegistrationStore.currentStep === 3}
          <Step3Documents
            onSubmit={async (formData) => {
              await merchantRegistrationStore.submitStep3(formData);
            }}
            isLoading={merchantRegistrationStore.isLoading}
          />
        {:else if merchantRegistrationStore.currentStep === 4}
          <Step4BankAccount
            onSubmit={async (formData) => {
              await merchantRegistrationStore.submitStep4(formData);
            }}
            isLoading={merchantRegistrationStore.isLoading}
          />
        {:else if merchantRegistrationStore.currentStep === 5}
          <Step5MenuItems
            onSubmit={merchantRegistrationStore.submitStep5}
            isLoading={merchantRegistrationStore.isLoading}
          />
        {:else if merchantRegistrationStore.currentStep === 6}
          <Step6Submit
            onSubmit={async (formData) => {
              await merchantRegistrationStore.submitStep6(formData);
            }}
            isLoading={merchantRegistrationStore.isLoading}
            registrationData={merchantRegistrationStore.data}
          />
        {/if}
      </div>

      <!-- Navigation Buttons -->
      {#if merchantRegistrationStore.currentStep > 1 && merchantRegistrationStore.currentStep < 6}
        <RegistrationNavigation
          onBack={merchantRegistrationStore.prevStep}
          disabled={merchantRegistrationStore.isLoading}
        />
      {/if}

      <!-- Pending Registration Dialog -->
      <PendingDialog
        open={merchantRegistrationStore.showPendingDialog}
        storeName={merchantRegistrationStore.data.store_name}
        onContinue={merchantRegistrationStore.continueWithPendingRegistration}
        onCancel={merchantRegistrationStore.cancelPendingRegistration}
      />

      <!-- Submitted Dialog (3x24h wait) -->
      <SubmittedDialog
        open={merchantRegistrationStore.showSubmittedDialog}
        storeName={merchantRegistrationStore.data.store_name}
        onClose={merchantRegistrationStore.closeSubmittedDialog}
      />
    {/if}
  </div>
</div>
