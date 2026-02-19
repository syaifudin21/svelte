<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Button } from "$lib/components/ui/button";
	import { page } from "$app/stores";
	import { Toaster } from "$lib/components/ui/sonner";
	import { ModeWatcher } from "mode-watcher";
	import ForbiddenDialog from "$lib/components/forbidden-dialog.svelte";
	import { forbiddenDialog, closeForbiddenDialog } from "$lib/stores/forbidden.svelte";

	let { children } = $props();
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
