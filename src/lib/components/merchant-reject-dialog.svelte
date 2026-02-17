<script lang="ts">
  import * as Dialog from "$lib/components/ui/dialog";
  import { Button } from "$lib/components/ui/button";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import { Label } from "$lib/components/ui/label";
  import { merchantService } from "$lib/services/merchant.service";
  import { toast } from "svelte-sonner";
  import { XCircle } from "lucide-svelte";

  interface Props {
    uuid: string;
    onSuccess?: () => void;
  }

  let { uuid, onSuccess }: Props = $props();

  let open = $state(false);
  let loading = $state(false);

  const commonReasons = [
    "Invalid document clarity",
    "License expired",
    "Incomplete store address",
    "Store name not allowed",
    "Product images do not meet requirements",
  ];

  let selectedReasons = $state<string[]>([]);
  let customReason = $state("");

  async function handleSubmit() {
    const finalReasons = [...selectedReasons];
    if (customReason.trim()) {
      finalReasons.push(customReason.trim());
    }

    if (finalReasons.length === 0) {
      toast.error("Harap pilih setidaknya satu alasan penolakan");
      return;
    }

    loading = true;
    try {
      await merchantService.rejectMerchant(uuid, finalReasons);
      toast.success("Merchant telah ditolak.");
      open = false;
      onSuccess?.();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menolak merchant");
    } finally {
      loading = false;
    }
  }

  function toggleReason(reason: string) {
    if (selectedReasons.includes(reason)) {
      selectedReasons = selectedReasons.filter((r) => r !== reason);
    } else {
      selectedReasons = [...selectedReasons, reason];
    }
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Trigger>
    <Button variant="destructive" class="gap-2">
      <XCircle class="h-4 w-4" />
      Reject
    </Button>
  </Dialog.Trigger>
  <Dialog.Content class="sm:max-w-[425px]">
    <Dialog.Header>
      <Dialog.Title>Tolak Pendaftaran Merchant</Dialog.Title>
      <Dialog.Description>
        Pilih alasan penolakan untuk dikirimkan kepada merchant.
      </Dialog.Description>
    </Dialog.Header>
    <div class="grid gap-4 py-4">
      <div class="space-y-3">
        {#each commonReasons as reason}
          <div class="flex items-center space-x-2">
            <Checkbox
              id={reason}
              checked={selectedReasons.includes(reason)}
              onCheckedChange={() => toggleReason(reason)}
            />
            <Label
              for={reason}
              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {reason}
            </Label>
          </div>
        {/each}
      </div>
      <div class="space-y-2">
        <Label for="customReason">Alasan Lain (Opsional)</Label>
        <textarea
          id="customReason"
          bind:value={customReason}
          class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Tuliskan alasan lainnya di sini..."
        ></textarea>
      </div>
    </div>
    <Dialog.Footer>
      <Button
        variant="outline"
        onclick={() => (open = false)}
        disabled={loading}>Batal</Button
      >
      <Button variant="destructive" onclick={handleSubmit} disabled={loading}>
        {loading ? "Memproses..." : "Tolak Merchant"}
      </Button>
    </Dialog.Footer>
  </Dialog.Content>
</Dialog.Root>
