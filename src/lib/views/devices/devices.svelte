<script lang="ts">
  import { onMount } from "svelte";
  import { deviceStore } from "$lib/stores/device.svelte";
  import * as Table from "$lib/components/ui/table";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import { Trash2, Smartphone } from "lucide-svelte";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";

  let revokingJti: string | null = null;
  let deviceToRevoke: string | null = null;

  onMount(async () => {
    await deviceStore.loadDevices();
  });

  function openRevokeDialog(jti: string) {
    deviceToRevoke = jti;
  }

  function cancelRevoke() {
    deviceToRevoke = null;
  }

  async function confirmRevoke() {
    if (!deviceToRevoke) return;

    const jti = deviceToRevoke;
    revokingJti = jti;
    try {
      await deviceStore.revokeDevice(jti);
      deviceToRevoke = null;
    } catch (error) {
      // Toast handled in store
    } finally {
      revokingJti = null;
    }
  }

  function formatDate(dateString: string) {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }
</script>

<Card.Root>
  <Card.Header>
    <Card.Title>Active Sessions</Card.Title>
    <Card.Description>Manage your active sessions and devices.</Card.Description
    >
  </Card.Header>
  <Card.Content>
    {#if deviceStore.isLoading}
      <div class="flex justify-center p-8">
        <span class="loading loading-spinner loading-lg">Loading...</span>
      </div>
    {:else if deviceStore.devices.length === 0}
      <div class="text-center p-8 text-muted-foreground">
        No active devices found.
      </div>
    {:else}
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.Head class="w-[50px]"></Table.Head>
            <Table.Head>Device Info</Table.Head>
            <Table.Head>Last Active</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head class="text-right">Action</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each deviceStore.devices as device}
            <Table.Row>
              <Table.Cell>
                <Smartphone class="h-5 w-5 text-muted-foreground" />
              </Table.Cell>
              <Table.Cell>
                <div class="font-medium">
                  {device.device_info || "Unknown Device"}
                </div>
                <div class="text-xs text-muted-foreground">
                  ID: {device.id}
                </div>
              </Table.Cell>
              <Table.Cell>{formatDate(device.created_at)}</Table.Cell>
              <Table.Cell>
                {#if device.isCurrent}
                  <Badge
                    variant="default"
                    class="bg-green-500 hover:bg-green-600"
                    >Current Session</Badge
                  >
                {:else if device.logout_at}
                  <Badge variant="secondary">Logged Out</Badge>
                {:else}
                  <Badge variant="outline" class="text-blue-500 border-blue-500"
                    >Active</Badge
                  >
                {/if}
              </Table.Cell>
              <Table.Cell class="text-right">
                {#if !device.logout_at && !device.isCurrent}
                  <Button
                    variant="ghost"
                    size="icon"
                    onclick={() => openRevokeDialog(device.jti)}
                    disabled={revokingJti === device.jti}
                    class="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                  >
                    <Trash2 class="h-4 w-4" />
                    <span class="sr-only">Revoke</span>
                  </Button>
                {/if}
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    {/if}
  </Card.Content>
</Card.Root>

<AlertDialog.Root
  open={!!deviceToRevoke}
  onOpenChange={(open) => !open && cancelRevoke()}
>
  <AlertDialog.Content>
    <AlertDialog.Header>
      <AlertDialog.Title>Apakah Anda yakin?</AlertDialog.Title>
      <AlertDialog.Description>
        Tindakan ini akan mencabut akses device ini. Anda harus login ulang jika
        ingin menggunakan device ini kembali.
      </AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel onclick={cancelRevoke}>Batal</AlertDialog.Cancel>
      <AlertDialog.Action
        onclick={confirmRevoke}
        class={buttonVariants({ variant: "destructive" })}
      >
        {#if revokingJti}
          Loading...
        {:else}
          Cabut
        {/if}
      </AlertDialog.Action>
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
