<script lang="ts">
  import "./layout.css";
  import favicon from "$lib/assets/favicon.svg";
  import { Button } from "$lib/components/ui/button";
  import { page } from "$app/stores";
  import { Toaster } from "$lib/components/ui/sonner";
  import { ModeWatcher } from "mode-watcher";
  import ForbiddenDialog from "$lib/components/forbidden-dialog.svelte";
  import {
    forbiddenDialog,
    closeForbiddenDialog,
  } from "$lib/stores/forbidden.svelte";
  import { onMount } from "svelte";
  import { getFcmToken, listenForMessages } from "$lib/utils/firebase";
  import { deviceService } from "$lib/services/device.service";

  let { children } = $props();

  onMount(async () => {
    console.log("Layout onMount: Initializing FCM...");
    const token = await getFcmToken();
    console.log(
      "Layout onMount: FCM Token retrieval finished. Token found:",
      !!token,
    );

    if (token && typeof window !== "undefined") {
      const authToken = localStorage.getItem("token");
      if (authToken) {
        console.log("Layout onMount: User is logged in, syncing FCM token...");
        try {
          await deviceService.updateFcmToken(token);
          console.log("Layout onMount: FCM token sync successful");
        } catch (err) {
          console.error("Layout onMount: FCM token sync failed", err);
        }
      }
    }

    listenForMessages();
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<div class="relative flex min-h-screen flex-col bg-background text-foreground">
  <main class="flex-1">
    {@render children()}
  </main>
  <Toaster />
  <ModeWatcher />
</div>

<ForbiddenDialog
  open={$forbiddenDialog.open}
  title={$forbiddenDialog.title}
  description={$forbiddenDialog.description}
  onClose={closeForbiddenDialog}
/>
