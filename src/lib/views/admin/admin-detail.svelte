<script lang="ts">
  import { onMount } from "svelte";
  import { adminService } from "$lib/services/admin.service";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import * as Select from "$lib/components/ui/select";
  import { Label } from "$lib/components/ui/label";
  import { regionService } from "$lib/services/region.service";
  import { ArrowLeft, Plus, X } from "lucide-svelte";
  import { toast } from "svelte-sonner";

  let { id } = $props();

  let admin = $state<any>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);

  // Work Area Dialog State
  let openWorkAreaDialog = $state(false);
  let provinces = $state<any[]>([]);
  let regencies = $state<any[]>([]);
  let selectedProvinceId = $state("");
  let selectedRegencyIds = $state<string[]>([]);
  let loadingProvinces = $state(false);
  let loadingRegencies = $state(false);
  let savingWorkArea = $state(false);

  // Remove Work Area Dialog State
  let workAreaToRemove = $state<{ id: string; name: string } | null>(null);
  let removingWorkArea = $state(false);

  // Consolidate work area IDs from current admin for display/check if needed,

  onMount(async () => {
    await loadAdmin();
  });

  async function loadAdmin() {
    loading = true;
    error = null;
    try {
      const response = await adminService.getAdmin(id);
      if (response.data && response.data.length > 0) {
        admin = response.data[0];
      } else {
        error = "Admin not found";
      }
    } catch (err: any) {
      console.error("Failed to load admin:", err);
      error = "Failed to load admin details.";
      toast.error("Gagal memuat detail admin.");
    } finally {
      loading = false;
    }
  }

  async function openAddWorkArea() {
    openWorkAreaDialog = true;
    selectedProvinceId = "";
    selectedRegencyIds = [];
    await loadProvinces();
  }

  async function loadProvinces() {
    loadingProvinces = true;
    try {
      const res = await regionService.getProvinces();
      provinces = res.data;
    } catch (e) {
      console.error("Failed to load provinces", e);
      toast.error("Gagal memuat provinsi");
    } finally {
      loadingProvinces = false;
    }
  }

  async function loadRegencies(provId: string) {
    if (!provId) {
      regencies = [];
      return;
    }
    loadingRegencies = true;
    try {
      const res = await regionService.getRegenciesByProvince(provId);
      regencies = res.data;
    } catch (e) {
      console.error("Failed to load regencies", e);
      toast.error("Gagal memuat kabupaten/kota");
    } finally {
      loadingRegencies = false;
    }
  }

  function handleProvinceChange(value: string) {
    selectedProvinceId = value;
    selectedRegencyIds = []; // Reset selected regencies when province changes?
    loadRegencies(value);
  }

  function toggleRegency(regencyId: string) {
    if (selectedRegencyIds.includes(regencyId)) {
      selectedRegencyIds = selectedRegencyIds.filter((id) => id !== regencyId);
    } else {
      selectedRegencyIds = [...selectedRegencyIds, regencyId];
    }
  }

  function toggleAllRegencies() {
    if (selectedRegencyIds.length === regencies.length) {
      selectedRegencyIds = [];
    } else {
      selectedRegencyIds = regencies.map((r) => r.id);
    }
  }

  async function saveWorkArea() {
    if (selectedRegencyIds.length === 0) {
      toast.error("Pilih minimal satu area kerja");
      return;
    }

    savingWorkArea = true;
    try {
      await adminService.updateWorkArea(id, selectedRegencyIds);
      toast.success("Area kerja berhasil diperbarui");
      openWorkAreaDialog = false;
      loadAdmin(); // Reload to show new areas
    } catch (e) {
      console.error("Failed to save work area", e);
      toast.error("Gagal menyimpan area kerja");
    } finally {
      savingWorkArea = false;
    }
  }

  function removeWorkArea(areaId: string, areaName: string) {
    workAreaToRemove = { id: areaId, name: areaName };
  }

  async function confirmRemoveWorkArea() {
    if (!workAreaToRemove) return;

    removingWorkArea = true;
    try {
      await adminService.removeWorkArea(id, [workAreaToRemove.id]);
      toast.success("Area kerja berhasil dihapus");
      workAreaToRemove = null;
      loadAdmin();
    } catch (e) {
      console.error("Failed to remove work area", e);
      toast.error("Gagal menghapus area kerja");
    } finally {
      removingWorkArea = false;
    }
  }

  function cancelRemoveWorkArea() {
    workAreaToRemove = null;
  }

  function goBack() {
    history.back();
  }
</script>

{#if loading}
  <div class="flex justify-center p-8">
    <span class="loading loading-spinner loading-lg">Loading...</span>
  </div>
{:else if error}
  <div class="text-center p-8 text-destructive">
    {error}
  </div>
{:else if admin}
  <div class="grid gap-4 md:grid-cols-2">
    <Card.Root class="col-span-2 md:col-span-1">
      <Card.Header>
        <Card.Title>General Information</Card.Title>
      </Card.Header>
      <Card.Content class="grid gap-4">
        <div class="grid gap-1">
          <span class="text-sm font-medium text-muted-foreground">Name</span>
          <span class="text-base font-semibold">{admin.name || "-"}</span>
        </div>
        <div class="grid gap-1">
          <span class="text-sm font-medium text-muted-foreground">Username</span
          >
          <span class="text-base font-mono">{admin.username}</span>
        </div>
        <div class="grid gap-1">
          <span class="text-sm font-medium text-muted-foreground">Email</span>
          <span class="text-base">{admin.email || "-"}</span>
        </div>
        <div class="grid gap-1">
          <span class="text-sm font-medium text-muted-foreground">Status</span>
          <div>
            <Badge
              variant={admin.status === "approved"
                ? "default"
                : admin.status === "rejected"
                  ? "destructive"
                  : "secondary"}
              class="capitalize"
            >
              {admin.status}
            </Badge>
          </div>
        </div>
      </Card.Content>
    </Card.Root>

    <Card.Root class="col-span-2 md:col-span-1">
      <Card.Header>
        <Card.Title>System Information</Card.Title>
      </Card.Header>
      <Card.Content class="grid gap-4">
        <div class="grid gap-1">
          <span class="text-sm font-medium text-muted-foreground">ID</span>
          <span class="text-base font-mono">{admin.id}</span>
        </div>
        <div class="grid gap-1">
          <span class="text-sm font-medium text-muted-foreground">UUID</span>
          <span class="text-xs font-mono text-muted-foreground break-all"
            >{admin.uuid}</span
          >
        </div>
        <div class="grid gap-1">
          <span class="text-sm font-medium text-muted-foreground">User ID</span>
          <span class="text-base font-mono">{admin.user_id}</span>
        </div>
      </Card.Content>
    </Card.Root>

    <Card.Root class="col-span-2">
      <Card.Header class="flex flex-row items-center justify-between">
        <Card.Title>Work Areas</Card.Title>
        <Button variant="outline" size="sm" onclick={openAddWorkArea}>
          <Plus class="mr-2 h-4 w-4" />
          Add Work Area
        </Button>
      </Card.Header>
      <Card.Content>
        {#if admin.work_area && admin.work_area.length > 0}
          <div class="flex flex-wrap gap-2">
            {#each admin.work_area as area}
              <Badge variant="outline" class="flex items-center gap-1 pr-1">
                {area.name} (ID: {area.id})
                <button
                  class="ml-1 rounded-full p-0.5 hover:bg-muted"
                  onclick={() => removeWorkArea(area.id, area.name)}
                >
                  <X class="h-3 w-3" />
                  <span class="sr-only">Remove</span>
                </button>
              </Badge>
            {/each}
          </div>
        {:else}
          <span class="text-muted-foreground italic"
            >No work areas assigned.</span
          >
        {/if}
      </Card.Content>
    </Card.Root>

    {#if admin.status === "rejected" && admin.reject_notes}
      <Card.Root class="col-span-2 border-destructive/50 bg-destructive/5">
        <Card.Header>
          <Card.Title class="text-destructive">Rejection Notes</Card.Title>
        </Card.Header>
        <Card.Content>
          <p class="text-destructive-foreground">{admin.reject_notes}</p>
        </Card.Content>
      </Card.Root>
    {/if}
  </div>
{:else}
  <div class="text-center p-8 text-muted-foreground">Admin not found.</div>
{/if}

<Dialog.Root
  open={openWorkAreaDialog}
  onOpenChange={(open) => (openWorkAreaDialog = open)}
>
  <Dialog.Content class="sm:max-w-[500px]">
    <Dialog.Header>
      <Dialog.Title>Add Work Area</Dialog.Title>
      <Dialog.Description>
        Select province and regencies to assign work areas.
      </Dialog.Description>
    </Dialog.Header>

    <div class="grid gap-4 py-4">
      <div class="grid gap-2">
        <Label>Province</Label>
        <Select.Root
          type="single"
          onValueChange={handleProvinceChange}
          value={selectedProvinceId}
        >
          <Select.Trigger>
            {#if selectedProvinceId}
              {provinces.find((p) => p.id === selectedProvinceId)?.name}
            {:else}
              Select Province
            {/if}
          </Select.Trigger>
          <Select.Content class="max-h-[300px]">
            {#if loadingProvinces}
              <div class="p-2 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            {:else}
              {#each provinces as province}
                <Select.Item value={province.id}>{province.name}</Select.Item>
              {/each}
            {/if}
          </Select.Content>
        </Select.Root>
      </div>

      {#if selectedProvinceId}
        <div class="grid gap-2">
          <div class="flex items-center justify-between">
            <Label>Regencies (Select multiple)</Label>
            <Button
              variant="ghost"
              size="sm"
              onclick={toggleAllRegencies}
              class="h-6 px-2 text-xs"
              disabled={loadingRegencies || regencies.length === 0}
            >
              {selectedRegencyIds.length === regencies.length &&
              regencies.length > 0
                ? "Deselect All"
                : "Select All"}
            </Button>
          </div>
          {#if loadingRegencies}
            <div class="text-sm text-muted-foreground">
              Loading regencies...
            </div>
          {:else if regencies.length === 0}
            <div class="text-sm text-muted-foreground">No regencies found.</div>
          {:else}
            <div
              class="border rounded-md p-2 max-h-[200px] overflow-y-auto grid gap-1"
            >
              {#each regencies as regency}
                <button
                  class="flex items-center justify-between px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground w-full text-left"
                  onclick={() => toggleRegency(regency.id)}
                >
                  <span>{regency.name}</span>
                  {#if selectedRegencyIds.includes(regency.id)}
                    <Badge variant="default" class="ml-2">Selected</Badge>
                  {/if}
                </button>
              {/each}
            </div>
            <div class="text-xs text-muted-foreground">
              Selected: {selectedRegencyIds.length}
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <Dialog.Footer>
      <Button variant="outline" onclick={() => (openWorkAreaDialog = false)}
        >Cancel</Button
      >
      <Button
        onclick={saveWorkArea}
        disabled={savingWorkArea || selectedRegencyIds.length === 0}
      >
        {#if savingWorkArea}
          Saving...
        {:else}
          Save
        {/if}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>

<AlertDialog.Root
  open={!!workAreaToRemove}
  onOpenChange={(open) => !open && cancelRemoveWorkArea()}
>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Apakah Anda yakin?</AlertDialog.Title>
      <AlertDialog.Description>
        Tindakan ini akan menghapus area kerja "{workAreaToRemove?.name}" dari
        admin ini.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel onclick={cancelRemoveWorkArea}
        >Batal</AlertDialog.Cancel
      >
      <AlertDialog.Action
        onclick={confirmRemoveWorkArea}
        class={buttonVariants({ variant: "destructive" })}
        disabled={removingWorkArea}
      >
        {#if removingWorkArea}
          Menghapus...
        {:else}
          Hapus
        {/if}
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
