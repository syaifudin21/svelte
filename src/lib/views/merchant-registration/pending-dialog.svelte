<script lang="ts">
  import { merchantRegistrationStore } from "$lib/stores/merchant-registration.svelte";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Button } from "$lib/components/ui/button";

  export let open: boolean = false;
  export let storeName: string = "";
  export let onContinue: () => void;
  export let onCancel: () => void;
  
  const status = merchantRegistrationStore.data.status;
  
  function getDialogTitle() {
    if (status === 'approved') return 'Merchant Sudah Disetujui';
    if (status === 'rejected') return 'Merchant Ditolak';
    return 'Pendaftaran Sudah Ada';
  }
  
  function getDialogDescription() {
    if (status === 'approved') return 'Merchant Anda sudah disetujui. Anda dapat melanjutkan untuk mengelola merchant.';
    if (status === 'rejected') return 'Merchant Anda ditolak. Silakan perbaiki dan daftar ulang.';
    return 'Anda sudah memiliki pendaftaran merchant yang sedang menunggu persetujuan.';
  }
  
  function getContinueButtonText() {
    if (status === 'approved') return 'Kelola Merchant';
    if (status === 'rejected') return 'Daftar Ulang';
    return 'Lanjutkan Pendaftaran';
  }
  
  function handleContinue() {
    console.log('[Dialog] Handle continue clicked, status:', status);
    if (status === 'approved') {
      window.location.href = '/merchant/dashboard';
    } else if (status === 'rejected') {
      window.location.href = '/merchant/create';
    } else {
      // Close dialog first
      onCancel();
      // Then continue
      onContinue();
    }
  }
</script>

<AlertDialog.Root {open}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>{getDialogTitle()}</AlertDialog.Title>
    </AlertDialog.Header>
    <AlertDialog.Description>
      {getDialogDescription()}
      <div class="mt-2 p-3 bg-muted rounded-md">
        <p class="text-sm font-medium">Nama Merchant:</p>
        <p class="text-lg font-semibold">
          {storeName || "(Belum diisi)"}
        </p>
      </div>
      {#if status === 'submitted'}
        <p class="mt-2 text-sm text-blue-600 font-medium">
          Pendaftaran Anda sedang diverifikasi. Waktu tunggu 3x24 jam.
        </p>
      {/if}
    </AlertDialog.Description>
    <AlertDialog.Footer>
      <AlertDialog.Cancel onclick={onCancel}>
        Batal
      </AlertDialog.Cancel>
      <Button type="button" onclick={handleContinue} class="bg-primary text-primary-foreground hover:bg-primary/90">
        {getContinueButtonText()}
      </Button>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
