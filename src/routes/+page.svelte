<script lang="ts">
	import { Button } from "$lib/components/ui/button";
</script>

<main class="flex min-h-screen flex-col items-center justify-center bg-background p-24 text-foreground">
	<div class="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
		<p class="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
			SvelteKit + shadcn-svelte
		</p>
	</div>

	<div class="relative flex place-items-center flex-col gap-8">
		<h1 class="text-6xl font-bold tracking-tight">
			Welcome to your app
		</h1>
		<p class="text-xl text-muted-foreground">
			Beautifully designed components built with Radix Svelte and Tailwind CSS.
		</p>
		<div class="flex gap-4">
			<Button size="lg">Get Started</Button>
			<Button variant="outline" size="lg">Documentation</Button>
		</div>
	</div>
</main>
