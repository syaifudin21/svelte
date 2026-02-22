<script lang="ts">
	import { goto } from "$app/navigation";
	import { Button } from "$lib/components/ui/button";
	import * as Dialog from "$lib/components/ui/dialog";
	import { Badge } from "$lib/components/ui/badge";
	import UsersIcon from "@tabler/icons-svelte/icons/users";
	import ShoppingBagIcon from "@tabler/icons-svelte/icons/shopping-bag";
	import UserIcon from "@tabler/icons-svelte/icons/user";
	import { authStore } from "$lib/stores/auth.svelte";

	export let open = false;

	const roles = [
		{
			id: "admin",
			title: "Admin",
			description: "Kelola sistem, driver, merchant, dan konfigurasi platform",
			icon: UsersIcon,
			href: "/console/dashboard",
			color: "text-blue-600",
			bgColor: "bg-blue-50 dark:bg-blue-950",
			borderColor: "border-blue-200 dark:border-blue-800",
		},
		{
			id: "merchant",
			title: "Merchant",
			description: "Kelola toko, produk, dan pesanan pelanggan",
			icon: ShoppingBagIcon,
			href: "/merchant/dashboard",
			color: "text-green-600",
			bgColor: "bg-green-50 dark:bg-green-950",
			borderColor: "border-green-200 dark:border-green-800",
		},
		{
			id: "customer",
			title: "Customer",
			description: "Lihat pesanan, riwayat transaksi, dan pengaturan akun",
			icon: UserIcon,
			href: "/customer/dashboard",
			color: "text-purple-600",
			bgColor: "bg-purple-50 dark:bg-purple-950",
			borderColor: "border-purple-200 dark:border-purple-800",
		},
	];

	function selectRole(roleId: string, href: string) {
		localStorage.setItem("selectedRole", roleId);
		goto(href);
	}

	function handleClose() {
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-3xl">
		<Dialog.Header>
			<Dialog.Title>Pilih Role</Dialog.Title>
			<Dialog.Description>
				Selamat datang,
				<span class="font-medium text-foreground">
					{authStore.user?.full_name || authStore.user?.username || "User"}
				</span>!
				Pilih role yang ingin Anda gunakan untuk masuk.
			</Dialog.Description>
		</Dialog.Header>

		<div class="grid grid-cols-1 gap-4 py-4 sm:grid-cols-3">
			{#each roles as role}
				<div
					class="cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-md hover:scale-[1.02] {role.borderColor}"
					onclick={() => selectRole(role.id, role.href)}
				>
					<div class="flex items-center gap-3">
						<div class="flex h-12 w-12 items-center justify-center rounded-lg {role.bgColor}">
							<role.icon class="h-6 w-6 {role.color}" />
						</div>
						<div>
							<h3 class="font-semibold">{role.title}</h3>
							<Badge variant="outline" class="mt-1 text-xs">
								Klik untuk memilih
							</Badge>
						</div>
					</div>
					<p class="mt-3 text-sm text-muted-foreground">
						{role.description}
					</p>
					<Button class="mt-4 w-full" variant="outline">
						Masuk sebagai {role.title}
					</Button>
				</div>
			{/each}
		</div>
	</Dialog.Content>
</Dialog.Root>
