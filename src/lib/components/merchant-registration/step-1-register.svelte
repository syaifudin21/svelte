<script lang="ts">
  import { uiStore } from "$lib/stores/ui.svelte";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
  import * as Select from "$lib/components/ui/select";
  import { regionService } from "$lib/services/region.service";
  import type { Province, RegencyOption } from "$lib/types/region";

  type FormValues = {
    full_name: string;
    email: string;
    phone_number: string;
    work_area_id: string;
  };

  let { onSubmit, isLoading = false }: { onSubmit: (data: FormValues) => Promise<void>; isLoading?: boolean } = $props();

  let fullName = $state("");
  let email = $state("");
  let phoneNumber = $state("");
  let workAreaId = $state("");

  let provinces = $state<Province[]>([]);
  let regencies = $state<RegencyOption[]>([]);
  let selectedProvinceId = $state("");
  let selectedRegencyId = $state("");
  let loadingRegencies = $state(false);

  let errors = $state<Record<string, string>>({});

  // Load provinces on mount
  $effect(() => {
    async function loadProvinces() {
      try {
        const response = await regionService.getProvinces();
        provinces = response.data;
      } catch (error) {
        console.error("Failed to load provinces", error);
      }
    }
    loadProvinces();
  });

  // Load regencies when province changes
  $effect(() => {
    async function loadRegencies() {
      if (!selectedProvinceId) {
        regencies = [];
        selectedRegencyId = "";
        workAreaId = "";
        return;
      }

      loadingRegencies = true;
      try {
        const response = await regionService.getRegenciesByProvince(selectedProvinceId);
        regencies = response.data;
        selectedRegencyId = "";
        workAreaId = "";
      } catch (error) {
        console.error("Failed to load regencies", error);
        regencies = [];
      } finally {
        loadingRegencies = false;
      }
    }
    loadRegencies();
  });

  // Update work_area_id when regency is selected
  $effect(() => {
    if (selectedRegencyId) {
      workAreaId = selectedRegencyId;
    }
  });

  function validate(): boolean {
    errors = {};
    
    if (!fullName.trim()) {
      errors.full_name = uiStore.t("merchant_registration.step1.full_name_placeholder");
    }
    
    if (!email.trim()) {
      errors.email = uiStore.t("merchant_registration.step1.email_placeholder");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = uiStore.t("merchant_registration.step1.email_placeholder");
    }
    
    if (!phoneNumber.trim()) {
      errors.phone_number = uiStore.t("merchant_registration.step1.phone_placeholder");
    } else if (phoneNumber.replace(/\D/g, "").length < 10) {
      errors.phone_number = uiStore.t("merchant_registration.step1.phone_placeholder");
    }
    
    if (!workAreaId.trim()) {
      errors.work_area_id = uiStore.t("merchant_registration.step1.select_regency");
    }

    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (validate()) {
      await onSubmit({
        full_name: fullName,
        email: email,
        phone_number: phoneNumber,
        work_area_id: workAreaId,
      });
    }
  }
</script>

<Card>
  <CardHeader>
    <CardTitle>{uiStore.t("merchant_registration.step1.title")}</CardTitle>
    <CardDescription>
      {uiStore.t("merchant_registration.step1.description")}
    </CardDescription>
  </CardHeader>
  <CardContent>
    <form onsubmit={handleSubmit} class="space-y-4">
      <div class="space-y-2">
        <Label for="full_name">{uiStore.t("merchant_registration.step1.full_name")}</Label>
        <Input
          id="full_name"
          type="text"
          placeholder={uiStore.t("merchant_registration.step1.full_name_placeholder")}
          bind:value={fullName}
          disabled={isLoading}
          class={errors.full_name ? "border-destructive" : ""}
        />
        {#if errors.full_name}
          <p class="text-sm text-destructive">{errors.full_name}</p>
        {/if}
      </div>

      <div class="space-y-2">
        <Label for="email">{uiStore.t("merchant_registration.step1.email")}</Label>
        <Input
          id="email"
          type="email"
          placeholder={uiStore.t("merchant_registration.step1.email_placeholder")}
          bind:value={email}
          disabled={isLoading}
          class={errors.email ? "border-destructive" : ""}
        />
        {#if errors.email}
          <p class="text-sm text-destructive">{errors.email}</p>
        {/if}
      </div>

      <div class="space-y-2">
        <Label for="phone_number">{uiStore.t("merchant_registration.step1.phone")}</Label>
        <Input
          id="phone_number"
          type="tel"
          placeholder={uiStore.t("merchant_registration.step1.phone_placeholder")}
          bind:value={phoneNumber}
          disabled={isLoading}
          class={errors.phone_number ? "border-destructive" : ""}
        />
        {#if errors.phone_number}
          <p class="text-sm text-destructive">{errors.phone_number}</p>
        {/if}
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="province">{uiStore.t("merchant_registration.step1.province")}</Label>
          <Select.Root
            type="single"
            bind:value={selectedProvinceId}
            disabled={isLoading}
          >
            <Select.Trigger id="province">
              <span data-slot="select-value">
                {#if selectedProvinceId}
                  {provinces.find((p) => p.id === selectedProvinceId)?.name || uiStore.t("merchant_registration.step1.select_province")}
                {:else}
                  {uiStore.t("merchant_registration.step1.select_province")}
                {/if}
              </span>
            </Select.Trigger>
            <Select.Content>
              {#each provinces as province}
                <Select.Item value={province.id}>{province.name}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
        </div>

        <div class="space-y-2">
          <Label for="regency">{uiStore.t("merchant_registration.step1.regency")}</Label>
          <Select.Root
            type="single"
            bind:value={selectedRegencyId}
            disabled={!selectedProvinceId || loadingRegencies || isLoading}
          >
            <Select.Trigger id="regency">
              <span data-slot="select-value">
                {#if loadingRegencies}
                  {uiStore.t("merchant_registration.step1.loading")}
                {:else if selectedRegencyId}
                  {regencies.find((r) => r.id === selectedRegencyId)?.name || uiStore.t("merchant_registration.step1.select_regency")}
                {:else if !selectedProvinceId}
                  {uiStore.t("merchant_registration.step1.select_province_first")}
                {:else}
                  {uiStore.t("merchant_registration.step1.select_regency")}
                {/if}
              </span>
            </Select.Trigger>
            <Select.Content>
              {#each regencies as regency}
                <Select.Item value={regency.id}>{regency.name}</Select.Item>
              {/each}
            </Select.Content>
          </Select.Root>
          {#if errors.work_area_id}
            <p class="text-sm text-destructive">{errors.work_area_id}</p>
          {/if}
        </div>
      </div>

      <p class="text-xs text-muted-foreground">
        {uiStore.t("merchant_registration.step1.area_note")}
      </p>

      <Button type="submit" class="w-full" disabled={isLoading}>
        {#if isLoading}
          <span class="animate-spin mr-2">⏳</span>
          {uiStore.t("merchant_registration.step1.processing")}
        {:else}
          {uiStore.t("merchant_registration.step1.submit")}
        {/if}
      </Button>
    </form>
  </CardContent>
</Card>
