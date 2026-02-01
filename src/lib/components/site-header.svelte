<script lang="ts">
	import { Separator } from "$lib/components/ui/separator/index.js";
	import * as Sidebar from "$lib/components/ui/sidebar/index.js";
	import ModeToggle from "$lib/components/mode-toggle.svelte";
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { uiStore } from "$lib/stores/ui.svelte.js";
	import { Languages } from "lucide-svelte";
</script>


<header
	class="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)"
>
	<div class="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
		<Sidebar.Trigger class="-ms-1" />
		<Separator orientation="vertical" class="mx-2 data-[orientation=vertical]:h-4" />
		<h1 class="text-base font-medium">{uiStore.t("sidebar.dashboard")}</h1>
		<div class="ms-auto flex items-center gap-2">
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					{#snippet child({ props })}
						<Button variant="ghost" size="icon" {...props}>
							<Languages class="size-5" />
						</Button>

					{/snippet}
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					<DropdownMenu.Item onclick={() => uiStore.setLanguage("en")}>
						English {uiStore.language === "en" ? "✓" : ""}
					</DropdownMenu.Item>
					<DropdownMenu.Item onclick={() => uiStore.setLanguage("id")}>
						Bahasa Indonesia {uiStore.language === "id" ? "✓" : ""}
					</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
			<ModeToggle />
		</div>
	</div>
</header>

