<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Button } from "$lib/components/ui/button";
  import { Shield } from "lucide-svelte";

  interface Props {
    open: boolean;
    onClose?: () => void;
    title?: string;
    description?: string;
  }

  let {
    open,
    onClose,
    title = "Akses Ditolak",
    description = "Anda tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator jika Anda memerlukan akses.",
  }: Props = $props();
</script>

<AlertDialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose?.()}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title class="flex items-center gap-2 text-destructive">
        <Shield class="h-6 w-6" />
        {title}
      </AlertDialog.Title>
      <AlertDialog.Description>
        {description}
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <Button 
        variant="outline" 
        onclick={onClose}
      >
        Tutup
      </Button>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
