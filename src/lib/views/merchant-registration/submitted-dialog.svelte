<script lang="ts">
  import { uiStore } from "$lib/stores/ui.svelte";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";

  export let open: boolean = false;
  export let storeName: string = "";
  export let onClose: () => void;
</script>

<AlertDialog.Root {open}>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>{uiStore.t("merchant_registration.submitted_dialog.title")}</AlertDialog.Title>
      <AlertDialog.Description>
        <div class="mt-2 p-4 bg-muted rounded-md space-y-3">
          <div>
            <p class="text-sm font-medium">{uiStore.t("merchant_registration.pending_dialog.merchant_name")}</p>
            <p class="text-lg font-semibold">
              {storeName || uiStore.t("merchant_registration.pending_dialog.not_filled")}
            </p>
          </div>
          <div class="border-t pt-3">
            <p class="text-sm font-medium text-muted-foreground">{uiStore.t("merchant_registration.submitted_dialog.status")}</p>
            <div class="flex items-center gap-2 mt-1">
              <span class="inline-block w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
              <span class="text-lg font-semibold text-yellow-600">{uiStore.t("merchant_registration.submitted_dialog.waiting_verification")}</span>
            </div>
          </div>
        </div>
        <div class="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p class="text-sm font-semibold text-blue-800">{uiStore.t("merchant_registration.submitted_dialog.wait_time")}</p>
          <p class="text-2xl font-bold text-blue-600 mt-1">{uiStore.t("merchant_registration.submitted_dialog.wait_period")}</p>
          <p class="text-xs text-blue-700 mt-2">
            {uiStore.t("merchant_registration.submitted_dialog.wait_description")}
          </p>
        </div>
        <p class="mt-4 text-sm text-muted-foreground">
          {uiStore.t("merchant_registration.submitted_dialog.support_note")}
        </p>
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Action onclick={onClose} class="w-full">
        {uiStore.t("merchant_registration.submitted_dialog.understand")}
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
