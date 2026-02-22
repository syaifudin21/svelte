<script lang="ts">
  import { uiStore } from "$lib/stores/ui.svelte";
  import { merchantRegistrationStore } from "$lib/stores/merchant-registration.svelte";
  import { Check } from "lucide-svelte";

  export let currentStep: number = 1;
  export let totalSteps: number = 6;

  const steps = [
    { number: 1, title: uiStore.t("merchant_registration.steps.step1"), description: uiStore.t("merchant_registration.steps.step1_desc"), route: "/merchant/create" },
    { number: 2, title: uiStore.t("merchant_registration.steps.step2"), description: uiStore.t("merchant_registration.steps.step2_desc"), route: "/merchant/create/step-2" },
    { number: 3, title: uiStore.t("merchant_registration.steps.step3"), description: uiStore.t("merchant_registration.steps.step3_desc"), route: "/merchant/create/step-3" },
    { number: 4, title: uiStore.t("merchant_registration.steps.step4"), description: uiStore.t("merchant_registration.steps.step4_desc"), route: "/merchant/create/step-4" },
    { number: 5, title: uiStore.t("merchant_registration.steps.step5"), description: uiStore.t("merchant_registration.steps.step5_desc"), route: "/merchant/create/step-5" },
    { number: 6, title: uiStore.t("merchant_registration.steps.step6"), description: uiStore.t("merchant_registration.steps.step6_desc"), route: "/merchant/create/step-6" },
  ];

  function getStepStatus(stepNumber: number): "completed" | "current" | "upcoming" {
    if (stepNumber < currentStep) return "completed";
    if (stepNumber === currentStep) return "current";
    return "upcoming";
  }

  async function navigateToStep(stepNumber: number) {
    // Allow navigation to completed steps or current step
    if (stepNumber < currentStep) {
      // Load data from API before navigating
      try {
        await merchantRegistrationStore.loadStepData(stepNumber);
        const step = steps.find(s => s.number === stepNumber);
        if (step) {
          window.location.href = step.route;
        }
      } catch (err) {
        console.error('Failed to load step data:', err);
      }
    } else if (stepNumber === currentStep) {
      // Already on this step, reload to refresh data
      window.location.reload();
    }
  }
</script>

<div class="mb-8">
  <div class="relative">
    <!-- Progress Line (desktop) -->
    <div class="hidden md:block absolute top-5 left-0 right-0 h-0.5 bg-muted"></div>
    <div 
      class="hidden md:block absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500 ease-in-out"
      style="width: {((currentStep - 1) / (totalSteps - 1)) * 100}%;"
    ></div>

    <!-- Steps -->
    <div class="grid grid-cols-6 gap-0 md:gap-2 relative">
      {#each steps as step}
        {@const status = getStepStatus(step.number)}
        <div class="flex flex-col items-center">
          <!-- Step Circle -->
          <button
            type="button"
            onclick={() => navigateToStep(step.number)}
            class="relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
            {status === 'completed' ? 'bg-primary border-primary text-primary-foreground cursor-pointer hover:scale-110' : ''}
            {status === 'current' ? 'bg-background border-primary text-foreground scale-110 shadow-lg' : ''}
            {status === 'upcoming' ? 'bg-background border-muted text-muted-foreground cursor-not-allowed' : ''}"
            disabled={status === 'upcoming'}
          >
            {#if status === 'completed'}
              <Check class="w-5 h-5" />
            {:else}
              <span class="text-sm font-semibold">{step.number}</span>
            {/if}
          </button>
          
          <!-- Step Label (mobile - below) -->
          <div class="text-xs text-center mt-2 font-medium md:hidden w-16 truncate">
            {step.title}
          </div>
          
          <!-- Step Label (desktop) -->
          <div class="hidden md:block text-xs text-center mt-2 font-medium w-20 truncate {status === 'current' ? 'text-primary font-semibold' : 'text-muted-foreground'}">
            {step.title}
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
