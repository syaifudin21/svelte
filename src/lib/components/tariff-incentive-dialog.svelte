<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { tariffService } from "$lib/services/tariff.service";
  import type { Tariff } from "$lib/types/tariff";
  import { toast } from "svelte-sonner";
  import { Zap } from "lucide-svelte";

  interface Props {
    tariff: Tariff;
    onSuccess?: () => void;
  }

  let { tariff, onSuccess }: Props = $props();

  let open = $state(false);
  let loading = $state(false);
  let amount = $state(0);
  let durationHours = $state(2);

  // Update amount when tariff changes or dialog opens
  $effect(() => {
    if (open) {
      amount = tariff.incentive_fee || 0;
    }
  });

  async function handleSubmit() {
    loading = true;
    try {
      await tariffService.updateIncentive({
        service_id: tariff.service_id,
        regency_id: tariff.regency?.id || "",
        amount: amount,
        duration_hours: durationHours,
      });
      toast.success("Biaya insentif berhasil diperbarui.");
      open = false;
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal memperbarui insentif");
    } finally {
      loading = false;
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger>
    <Button variant="ghost" size="icon" class="h-8 w-8">
      <Zap
        class="h-4 w-4 {tariff.has_incentive
          ? 'fill-yellow-500 text-yellow-500'
          : 'text-muted-foreground'}"
      />
      <span class="sr-only">Set Incentive</span>
    </Button>
  </Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Set Insentif</Dialog.Title>
      <Dialog.Description>
        Tentukan biaya insentif tambahan untuk layanan ini di wilayah {tariff
          .regency?.name}.
      </Dialog.Description>
    </Dialog.Header>
    <div class="grid gap-4 py-4">
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="amount" class="text-right">Jumlah (Rp)</Label>
        <Input
          id="amount"
          type="number"
          bind:value={amount}
          class="col-span-3"
          placeholder="Contoh: 5000"
        />
      </div>
      <div class="grid grid-cols-4 items-center gap-4">
        <Label for="duration" class="text-right">Durasi (Jam)</Label>
        <Input
          id="duration"
          type="number"
          bind:value={durationHours}
          class="col-span-3"
          placeholder="Contoh: 2"
        />
      </div>
    </div>
    <Dialog.Footer>
      <Button type="submit" onclick={handleSubmit} disabled={loading}>
        {loading ? "Menyimpan..." : "Simpan Perubahan"}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
