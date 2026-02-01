<script lang="ts">

	import { Button } from "$lib/components/ui/button";
	import { Input } from "$lib/components/ui/input";
	import { Badge } from "$lib/components/ui/badge";
	import { Switch } from "$lib/components/ui/switch";
	import { uiStore } from "$lib/stores/ui.svelte";
	import { 
		Plus, 
		Search, 
		Edit, 
		Trash2, 
		Utensils, 
		ShoppingCart, 
		Pill, 
		Store,
		Info,
        ChevronRight
	} from "lucide-svelte";
	import { onMount } from "svelte";
	import type { Merchant, Product } from "$lib/types/merchant";

	let selectedMerchantId = $state('M-001');
    let searchQuery = $state("");
    let selectedCategory = $state("All");

	let products = $state<Product[]>([
		{
			id: 'P-001',
			name: 'Classic Wagyu Burger',
			price: 275000,
			description: 'Double wagyu beef, aged cheddar, truffle aioli on a brioche bun.',
			imageUrl: 'https://picsum.photos/id/163/400/300',
			inStock: true,
			isBestSeller: true
		},
		{
			id: 'P-002',
			name: 'Truffle Parmesan Fries',
			price: 90000,
			description: 'Hand-cut russet potatoes, truffle oil, and freshly grated parmesan.',
			imageUrl: 'https://picsum.photos/id/493/400/300',
			inStock: true
		},
		{
			id: 'P-003',
			name: 'Garden Green Salad',
			price: 180000,
			description: 'Organic kale, cherry tomatoes, cucumbers with lemon-tahini dressing.',
			imageUrl: 'https://picsum.photos/id/488/400/300',
			inStock: true,
			isVegan: true
		},
		{
			id: 'P-004',
			name: 'Double Espresso',
			price: 52500,
			description: 'Rich roast house blend coffee. Bold and intense flavor profile.',
			imageUrl: 'https://picsum.photos/id/425/400/300',
			inStock: false
		},
	]);

	const merchants: Merchant[] = [
		{ id: 'M-001', name: 'The Gourmet Burger Co.', category: 'Food', status: 'Online', location: 'Central Square, NY', productCount: 24, icon: Utensils },
		{ id: 'M-002', name: 'Daily Fresh Market', category: 'Grocery', status: 'Online', location: 'Brooklyn Ave, NY', productCount: 156, icon: ShoppingCart },
		{ id: 'M-003', name: 'QuickCare Pharmacy', category: 'Pharmacy', status: 'Offline', location: 'Harbor Road, NJ', productCount: 89, icon: Pill },
		{ id: 'M-004', name: 'Pasta Palace', category: 'Food', status: 'Online', location: 'East Side, NY', productCount: 42, icon: Utensils },
	];

    let categories = ["All", "Food", "Grocery", "Medical"];

	const activeMerchant = $derived(merchants.find(m => m.id === selectedMerchantId) || merchants[0]);

	function toggleStock(productId: string) {
		products = products.map(p =>
			p.id === productId ? { ...p, inStock: !p.inStock } : p
		);
	}

	onMount(() => {
		uiStore.setBreadcrumbs([
			{ label: uiStore.t("sidebar.dashboard"), href: "/dashboard" },
			{ label: "Merchant Catalog" }
		]);
	});
</script>

<div class="flex flex-col h-[calc(100vh-120px)] animate-in fade-in duration-500 overflow-hidden">
    <div class="flex-1 flex overflow-hidden min-h-0 bg-white dark:bg-slate-900 border-t md:border">
        <!-- Merchant Sidebar -->
        <section class="w-[360px] border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50/50 dark:bg-slate-950/30">
            <div class="p-6">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-bold text-slate-900 dark:text-white">Merchants</h2>
                    <Button
                        variant="secondary"
                        size="icon"
                        class="size-9 rounded-xl shadow-sm"
                        onclick={() => {}}
                    >
                        <Plus class="h-4 w-4" />
                    </Button>
                </div>

                <div class="flex gap-1 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl mb-4 overflow-x-auto no-scrollbar">
                    {#each categories as category}
                        <button 
                            class="flex-1 px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-all {selectedCategory === category 
                                ? 'bg-white dark:bg-slate-700 shadow-sm text-primary' 
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}"
                            onclick={() => selectedCategory = category}
                        >
                            {category}
                        </button>
                    {/each}
                </div>
            </div>

            <div class="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
                {#each merchants as merchant}
                    <button
                        onclick={() => selectedMerchantId = merchant.id}
                        class="w-full p-4 rounded-2xl shadow-sm text-left border transition-all duration-200 group {selectedMerchantId === merchant.id
                            ? 'bg-white dark:bg-slate-800 border-primary shadow-lg shadow-primary/5 ring-1 ring-primary/20'
                            : 'bg-white dark:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700 opacity-80 hover:opacity-100'
                        }"
                    >
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="font-bold text-sm text-slate-900 dark:text-white group-hover:text-primary transition-colors">{merchant.name}</h3>
                            <Badge variant={merchant.status === 'Online' ? 'default' : 'secondary'} class="text-[9px] font-bold uppercase tracking-wider py-0 px-2 h-5">
                                {merchant.status}
                            </Badge>
                        </div>
                        <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase tracking-tight">
                            <merchant.icon class="h-3 w-3" />
                            <span>{merchant.category} &bull; {merchant.productCount} Items</span>
                        </div>
                    </button>
                {/each}
            </div>
        </section>

        <!-- Catalog Main View -->
        <section class="flex-1 flex flex-col overflow-hidden bg-white dark:bg-slate-900">
            <header class="px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                    <h2 class="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{activeMerchant.name}</h2>
                    <p class="text-sm text-slate-500 font-medium">Managing {activeMerchant.productCount} products &bull; {activeMerchant.location}</p>
                </div>
                <div class="flex items-center gap-3">
                    <Button variant="outline" class="rounded-xl font-bold text-xs uppercase tracking-wider px-5 h-11" onclick={() => {}}>
                        <Edit class="h-4 w-4 mr-2" />
                        Edit Merchant
                    </Button>
                    <Button class="rounded-xl font-bold text-xs uppercase tracking-wider px-5 h-11 shadow-lg shadow-primary/20" onclick={() => {}}>
                        <Plus class="h-4 w-4 mr-2" />
                        Add New Product
                    </Button>
                </div>
            </header>

            <div class="px-8 py-4 border-b border-slate-50 dark:border-slate-800/50 flex items-center gap-4 bg-slate-50/30 dark:bg-slate-800/10">
                <div class="relative flex-1 max-w-md">
                    <Search class="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        class="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 h-10 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Search products in this store..."
                        bind:value={searchQuery}
                    />
                </div>
                <select class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 h-10 text-xs font-bold text-slate-500 focus:ring-2 focus:ring-primary/20 transition-all outline-none">
                    <option>All Categories</option>
                    <option>Burgers</option>
                    <option>Sides</option>
                    <option>Beverages</option>
                </select>
            </div>

            <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                    {#each products as product}
                        <div class="overflow-hidden group hover:-translate-y-1 transition-all duration-300 flex flex-col bg-white dark:bg-slate-900">
                            <div class="h-48 relative bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden">
                                <img
                                    src={product.imageUrl}
                                    class={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${!product.inStock ? 'grayscale' : ''}`}
                                    alt={product.name}
                                />
                                {#if !product.inStock}
                                    <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
                                        <Badge variant="destructive" class="px-4 py-1.5 rounded-full font-bold uppercase text-[10px] shadow-lg border-2 border-white/20">
                                            Out of Stock
                                        </Badge>
                                    </div>
                                {/if}
                                <div class="absolute top-4 right-4 flex flex-col gap-2">
                                    {#if product.isBestSeller}
                                        <Badge class="bg-primary/90 backdrop-blur-md text-white text-[9px] px-2.5 py-1 rounded-lg font-bold shadow-sm border-none">
                                            BEST SELLER
                                        </Badge>
                                    {/if}
                                    {#if product.isVegan}
                                        <Badge class="bg-emerald-500/90 backdrop-blur-md text-white text-[9px] px-2.5 py-1 rounded-lg font-bold shadow-sm border-none">
                                            VEGAN
                                        </Badge>
                                    {/if}
                                </div>
                            </div>

                            <div class="py-5 flex-1 flex flex-col">
                                <div class="flex justify-between items-start mb-2">
                                    <h4 class="font-bold text-base text-slate-900 dark:text-white truncate pr-2 group-hover:text-primary transition-colors">{product.name}</h4>
                                    <span class="text-primary font-bold text-base whitespace-nowrap">Rp {product.price.toLocaleString('id-ID')}</span>
                                </div>
                                <p class="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-6 leading-relaxed flex-1 italic">
                                    {product.description}
                                </p>

                                <div class="flex items-center justify-between pt-5 border-t border-slate-50 dark:border-slate-800/10">
                                    <div class="flex items-center gap-3">
                                        <span class={`text-[10px] font-bold uppercase tracking-wider ${product.inStock ? 'text-slate-400' : 'text-red-400'}`}>
                                            {product.inStock ? 'In Stock' : 'Stock'}
                                        </span>
                                        <Switch checked={product.inStock} onCheckedChange={() => toggleStock(product.id)} />
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" class="h-8 w-8 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/10 transition-all" onclick={() => {}}>
                                            <Edit class="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" class="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all" onclick={() => {}}>
                                            <Trash2 class="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </section>
    </div>
</div>

<style>
    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
    .no-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }
    .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #e2e8f0;
        border-radius: 10px;
    }
</style>
