<script lang="ts">

	import { Button } from "$lib/components/ui/button";
	import * as Dialog from "$lib/components/ui/dialog";
	import { Input } from "$lib/components/ui/input";
	import * as Table from "$lib/components/ui/table";
	import { Badge } from "$lib/components/ui/badge";
	import * as Avatar from "$lib/components/ui/avatar";
	import { Tabs, TabsContent, TabsList, TabsTrigger } from "$lib/components/ui/tabs";
    import * as Checkbox from "$lib/components/ui/checkbox";
	import { uiStore } from "$lib/stores/ui.svelte";
	import { 
		LayoutDashboard,
		User,
		FileText,
		Wallet,
		TrendingUp,
		Truck,
		Star,
		Phone,
		Mail,
		MapPin,
		Car,
		Calendar,
		Palette,
		Hash,
		Info,
		ZoomIn,
		ZoomOut,
		Gavel,
		Download,
		ImageIcon,
        Loader2
	} from "lucide-svelte";
	import { onMount } from "svelte";
	import { driverService } from "$lib/services/driver.service";
	import type { WalletItem, WalletResponse, DriverDetailResponse, DriverDetailData } from "$lib/types/driver";


	let { id = "DRV-88219" } = $props();

	let activeTab = $state("Overview");
	let selectedDoc = $state("KTP");
	let zoom = $state(100);

	let walletData = $state<WalletResponse | null>(null);
    let driverDetailData = $state<DriverDetailData | null>(null);
    let isLoadingWallet = $state(false);
    let isLoadingDriver = $state(false);


    const driver = $derived({
		name: driverDetailData?.driver.full_name || 'Loading...',
		id: driverDetailData?.driver.uuid || id,
		service: driverDetailData?.service.name || 'Ride',
		imageUrl: driverDetailData?.driver.image_url || 'https://picsum.photos/id/64/200/200',
		phone: driverDetailData?.driver.phone_number || '-',
		email: driverDetailData?.user.email || 'No email provided',
		joined: driverDetailData?.driver.joined_at ? new Date(driverDetailData.driver.joined_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '-',
		address: driverDetailData?.driver.address || '-',
		vehicle: driverDetailData?.driver.vehicle || '-',
		plate: driverDetailData?.driver.plate_number || '-',
		color: driverDetailData?.driver.color || '-',
		revenue: driverDetailData?.summary.total_revenue || 0,
		orders: driverDetailData?.summary.total_orders || 0,
		rating: driverDetailData?.rating.average || 0,
		walletBalance: walletData?.data.last_balance || 0
	});

	const documents = $derived([
		{ id: 'KTP', name: 'KTP (ID Card)', status: driverDetailData?.driver.ktp_url ? 'Verified' : 'Missing', icon: User, color: driverDetailData?.driver.ktp_url ? 'text-emerald-500' : 'text-slate-400', url: driverDetailData?.driver.ktp_url },
		{ id: 'SIM', name: "SIM (Driver's License)", status: driverDetailData?.driver.sim_url ? 'Verified' : 'Pending', icon: Car, color: driverDetailData?.driver.sim_url ? 'text-emerald-500' : 'text-slate-400', url: driverDetailData?.driver.sim_url },
		{ id: 'STNK', name: 'STNK (Registration)', status: driverDetailData?.driver.stnk_url ? 'Verified' : 'Missing', icon: FileText, color: driverDetailData?.driver.stnk_url ? 'text-emerald-500' : 'text-slate-400', url: driverDetailData?.driver.stnk_url },
		{ id: 'SKCK', name: 'SKCK (Police Record)', status: driverDetailData?.driver.skck_url ? 'Verified' : 'Missing', icon: FileText, color: driverDetailData?.driver.skck_url ? 'text-emerald-500' : 'text-slate-400', url: driverDetailData?.driver.skck_url },
	]);

    const activeDoc = $derived(documents.find(d => d.id === selectedDoc));


	// const walletHistory = [
	// 	{ id: 'WH-001', transaction_type: 'Credit', description: 'Order #TX-98421 Earning', amount: 312300, date: 'Oct 24, 2023, 14:35', balance: 18607500 },
	// 	{ id: 'WH-002', transaction_type: 'Debit', description: 'Withdrawal to Bank Account', amount: -7500000, date: 'Oct 23, 2023, 09:15', balance: 18295200 },
	// 	{ id: 'WH-003', transaction_type: 'Credit', description: 'Order #TX-98405 Earning', amount: 231000, date: 'Oct 22, 2023, 18:20', balance: 25795200 },
	// 	{ id: 'WH-004', transaction_type: 'Credit', description: 'Bonus: 10 Trips Daily Streak', amount: 750000, date: 'Oct 22, 2023, 20:00', balance: 25564200 },
	// 	{ id: 'WH-005', transaction_type: 'Debit', description: 'Platform Service Fee Fee', amount: -37500, date: 'Oct 22, 2023, 14:10', balance: 24814200 },
	// ];


	onMount(() => {
		uiStore.setBreadcrumbs([
			{ label: uiStore.t("sidebar.dashboard"), href: "/dashboard" },
			{ label: uiStore.t("driver.title"), href: "/driver" },
			{ label: "Driver Details" }
		]);
        loadDriverDetail();
        loadWalletData();
	});

    async function loadDriverDetail() {
        isLoadingDriver = true;
        try {
            const response = await driverService.getDriverDetail(id);
            driverDetailData = response.data;
        } catch (error) {
            console.error("Failed to load driver detail:", error);
        } finally {
            isLoadingDriver = false;
        }
    }

    async function loadWalletData() {
        isLoadingWallet = true;
        try {
            walletData = await driverService.getDriverWallet(id);
        } catch (error) {
            console.error("Failed to load wallet data:", error);
        } finally {
            isLoadingWallet = false;
        }
    }

    function setZoom(val: number) {
        zoom = Math.max(50, Math.min(200, val));
    }

    let pan = $state({ x: 0, y: 0 });
    let isDragging = $state(false);
    let startPos = { x: 0, y: 0 };
    let isDialogOpen = $state(false);
    let dialogDoc = $state<typeof documents[0] | null>(null);

    function handleWheel(e: WheelEvent) {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = e.deltaY * -1; // Normalize direction
            setZoom(zoom + delta);
        } else {
             e.preventDefault();
             setZoom(zoom - e.deltaY * 0.5);
        }
    }

    function handleMouseDown(e: MouseEvent) {
        isDragging = true;
        startPos = { x: e.clientX - pan.x, y: e.clientY - pan.y };
    }

    function handleMouseMove(e: MouseEvent) {
        if (!isDragging) return;
        e.preventDefault();
        pan.x = e.clientX - startPos.x;
        pan.y = e.clientY - startPos.y;
    }

    function handleMouseUp() {
        isDragging = false;
    }

    function openDocumentDialog(doc: typeof documents[0]) {
        dialogDoc = doc;
        isDialogOpen = true;
        // Reset zoom and pan when opening
        zoom = 100;
        pan = { x: 0, y: 0 };
    }


</script>

<div class="flex items-center justify-between mt-6 mb-4">
	<h2 class="text-3xl font-bold tracking-tight">Driver Details</h2>
</div>

<div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
	<div>
		<div class="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
			<div class="flex items-center gap-5">
				<Avatar.Root class="w-24 h-24 rounded-2xl border-4 border-white dark:border-slate-800 shadow-lg">
					<Avatar.Image src={driver.imageUrl} alt={driver.name} />
					<Avatar.Fallback class="rounded-2xl text-2xl">{driver.name.charAt(0)}</Avatar.Fallback>
				</Avatar.Root>
				<div>
					<div class="flex items-center gap-3 mb-1">
						<h2 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{driver.name}</h2>
						<Badge variant="secondary" class="text-[10px] font-bold uppercase tracking-wider">
							{driver.service}
						</Badge>
					</div>
					<p class="text-slate-500 dark:text-slate-400 font-medium">ID: {driver.id}</p>
				</div>
			</div>

			<div class="flex items-center gap-3">
				<Button
					onclick={() => {}}
					class="font-bold shadow-lg shadow-primary/20"
				>
					{uiStore.t("driver_detail.edit_profile")}
				</Button>
			</div>
		</div>

	<Tabs bind:value={activeTab} class="w-full">
		<TabsList class="mb-8">
			<TabsTrigger value="Overview">{uiStore.t("driver_detail.overview")}</TabsTrigger>
			<TabsTrigger value="Documents">{uiStore.t("driver_detail.documents")}</TabsTrigger>
			<TabsTrigger value="Wallet History">{uiStore.t("driver_detail.wallet_history")}</TabsTrigger>
		</TabsList>

		<TabsContent value="Overview" class="mt-0 space-y-8 animate-in fade-in duration-300">
			<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="p-6 bg-white dark:bg-slate-800 border-none md:border border-slate-100 dark:border-slate-800 rounded-2xl">
                    <div class="flex justify-between items-start mb-4">
                        <div class="p-2 bg-green-500/10 text-green-500 rounded-lg">
                            <TrendingUp class="h-5 w-5" />
                        </div>
                        <Badge variant="secondary" class="text-[10px] font-bold text-green-500 bg-green-500/10 border-none">+12.5%</Badge>
                    </div>
                    <p class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{uiStore.t("driver_detail.total_revenue")}</p>
                    <h3 class="text-2xl font-bold text-slate-900 dark:text-white">Rp {driver.revenue.toLocaleString('id-ID')}</h3>
                </div>

                <div class="p-6 bg-white dark:bg-slate-800 border-none md:border border-slate-100 dark:border-slate-800 rounded-2xl">
                    <div class="flex justify-between items-start mb-4">
                        <div class="p-2 bg-primary/10 text-primary rounded-lg">
                            <Truck class="h-5 w-5" />
                        </div>
                        <Badge variant="secondary" class="text-[10px] font-bold text-primary bg-primary/10 border-none">1,240 Total</Badge>
                    </div>
                    <p class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{uiStore.t("dashboard.sales")}</p>
                    <h3 class="text-2xl font-bold text-slate-900 dark:text-white">{driver.orders}</h3>
                </div>

                <div class="p-6 bg-white dark:bg-slate-800 border-none md:border border-slate-100 dark:border-slate-800 rounded-2xl">
                    <div class="flex justify-between items-start mb-4">
                        <div class="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                            <Star class="h-5 w-5 fill-amber-500" />
                        </div>
                        <Badge variant="secondary" class="text-[10px] font-bold text-amber-500 bg-amber-500/10 border-none">Last 30 days</Badge>
                    </div>
                    <p class="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Average Rating</p>
                    <h3 class="text-2xl font-bold text-slate-900 dark:text-white">{driver.rating}</h3>
                </div>
			</div>

			<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div class="space-y-6 bg-white dark:bg-slate-800 border-none md:border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
                    <h3 class="text-lg font-bold uppercase tracking-tight mb-6">{uiStore.t("driver_detail.contact_info")}</h3>
                    <div class="space-y-6">
                        <div>
                            <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{uiStore.t("driver_detail.phone")}</p>
                            <p class="text-sm font-bold text-slate-900 dark:text-white">{driver.phone}</p>
                        </div>
                        <div>
                            <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{uiStore.t("driver_detail.email")}</p>
                            <p class="text-sm font-bold text-slate-900 dark:text-white">{driver.email}</p>
                        </div>
                        <div>
                            <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{uiStore.t("driver_detail.address")}</p>
                            <p class="text-sm font-bold text-slate-900 dark:text-white">{driver.address}</p>
                        </div>
                    </div>
                </div>

                <div class="bg-white dark:bg-slate-800 border-none md:border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
                    <h3 class="text-lg font-bold uppercase tracking-tight mb-6">{uiStore.t("driver_detail.vehicle_details")}</h3>
                    <div class="grid grid-cols-2 gap-6">
                        <div>
                            <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{uiStore.t("driver_detail.model")}</p>
                            <p class="text-sm font-bold text-slate-900 dark:text-white">{driver.vehicle}</p>
                        </div>
                        <div>
                            <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{uiStore.t("driver_detail.plate_number")}</p>
                            <p class="text-sm font-bold text-slate-900 dark:text-white">{driver.plate}</p>
                        </div>
                        <div>
                            <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{uiStore.t("driver_detail.color")}</p>
                            <div class="flex items-center gap-2">
                                <div class="size-3 rounded-full bg-slate-900 border border-slate-700"></div>
                                <p class="text-sm font-bold text-slate-900 dark:text-white">{driver.color}</p>
                            </div>
                        </div>
                        <div>
                            <p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">{uiStore.t("driver_detail.reg_date")}</p>
                            <p class="text-sm font-bold text-slate-900 dark:text-white">{driver.joined}</p>
                        </div>
                    </div>
                </div>
			</div>
		</TabsContent>

		<TabsContent value="Documents" class="mt-0 flex-1 flex flex-col min-h-0 animate-in fade-in duration-300 overflow-hidden">
			<div class="flex-1 flex gap-6 min-h-0 overflow-hidden">
                <!-- Left: Document List Panel -->
                <div class="w-72 flex flex-col gap-6 overflow-y-auto pr-2">
                    <div class="space-y-3">
                        <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">{uiStore.t("driver_detail.required_items")}</p>
                        {#each documents as doc}
                            <div class="w-full flex items-center gap-2 p-4 rounded-xl border bg-white dark:bg-background-dark border-slate-200 dark:border-slate-800">
                                <div class="flex items-center gap-3 flex-1 min-w-0">
                                    <doc.icon class="h-5 w-5 text-slate-600 dark:text-slate-300" />
                                    <div class="min-w-0">
                                        <p class="text-sm font-bold truncate text-slate-900 dark:text-white">{doc.name}</p>
                                        <p class="text-[10px] font-medium text-slate-400">{doc.status}</p>
                                    </div>
                                </div>
                                {#if doc.url}
                                    <Button size="sm" variant="outline" onclick={() => openDocumentDialog(doc)}>
                                        <ImageIcon class="h-3 w-3 mr-1" />
                                        View
                                    </Button>
                                {:else}
                                    <Button size="sm" variant="ghost" disabled>
                                        No File
                                    </Button>
                                {/if}
                            </div>
                        {/each}
                    </div>

                    <div class="bg-primary/5 dark:bg-primary/10 border border-primary/20 p-5 rounded-xl mt-auto">
                        <h4 class="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Info class="h-3 w-3" />
                            {uiStore.t("driver_detail.admin_note")}
                        </h4>
                        <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                            "Check for holographic patterns on the KTP and ensure SIM expiration is at least 6 months away."
                        </p>
                    </div>
                </div>

                <!-- Decision Panel -->
                <div class="flex-1 flex flex-col gap-6 overflow-y-auto">
                    <div class="bg-white dark:bg-slate-800 border-none md:border border-slate-100 dark:border-slate-800 rounded-2xl p-6">
                        <h3 class="text-lg font-bold flex items-center gap-2 mb-6">
                            <Gavel class="h-5 w-5 text-primary" />
                            {uiStore.t("driver_detail.adjudication")}
                        </h3>
                        <div class="space-y-4">
                            <div class="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{uiStore.t("driver_detail.quick_validation")}</p>
                                <div class="space-y-3">
                                    {#each ['Expiry Date Valid', 'Matches Profile', 'Legible Copy'] as check}
                                        <label class="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300 cursor-pointer">
                                            <Checkbox.Root />
                                            {check}
                                        </label>
                                    {/each}
                                </div>
                            </div>

                            <div class="flex flex-col gap-3 pt-4">
                                <Button class="w-full py-6 font-bold shadow-lg shadow-primary/20">
                                    {uiStore.t("driver_detail.approve_next")}
                                </Button>
                                <Button variant="secondary" class="w-full py-6 font-bold bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 border-none transition-all">
                                    {uiStore.t("driver_detail.reject_doc")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
		</TabsContent>

		<TabsContent value="Wallet History" class="mt-0 animate-in fade-in duration-300">
			<div class="bg-white dark:bg-slate-800 border-none md:border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
                <div class="flex flex-row items-center justify-between border-b border-slate-100 dark:border-slate-800 px-8 py-6">
                    <div>
                        <h3 class="text-xl font-bold uppercase tracking-tight">{uiStore.t("driver_detail.wallet_ledger")}</h3>
                        <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">
                            {uiStore.t("driver_detail.current_balance")}: 
                            <span class="text-primary font-bold font-mono">
                                {walletData ? `Rp ${walletData.data.last_balance.toLocaleString('id-ID')}` : 'Rp 0'}
                            </span>
                        </p>
                    </div>
                    <Button variant="outline" class="font-bold uppercase tracking-wider text-xs px-4">
                        <Download class="h-4 w-4 mr-2" />
                        {uiStore.t("driver_detail.export_statement")}
                    </Button>
                </div>
                <div>
                    <Table.Root>
                        <Table.Header class="bg-slate-50 dark:bg-slate-800/50">
                            <Table.Row>
                                <Table.Head class="px-8 text-[10px] font-semibold uppercase tracking-widest">{uiStore.t("driver_detail.transaction_id")}</Table.Head>
                                <Table.Head class="px-8 text-[10px] font-semibold uppercase tracking-widest">{uiStore.t("driver_detail.description")}</Table.Head>
                                <Table.Head class="px-8 text-[10px] font-semibold uppercase tracking-widest text-right">{uiStore.t("driver_detail.amount")}</Table.Head>
                                <Table.Head class="px-8 text-[10px] font-semibold uppercase tracking-widest text-right">{uiStore.t("driver_detail.balance")}</Table.Head>
                                <Table.Head class="px-8 text-[10px] font-semibold uppercase tracking-widest text-right">{uiStore.t("driver_detail.timestamp")}</Table.Head>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {#if isLoadingWallet}
                                <Table.Row>
                                    <Table.Cell colspan={5} class="text-center py-8 text-slate-500">
                                        Loading wallet history...
                                    </Table.Cell>
                                </Table.Row>
                            {:else if walletData && walletData.data.items.length > 0}
                                {#each walletData.data.items as row}
                                    <Table.Row class="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                                        <Table.Cell class="px-8 py-5">
                                            <span class="font-mono text-xs font-bold text-slate-500">{row.id}</span>
                                        </Table.Cell>
                                        <Table.Cell class="px-8 py-5">
                                            <p class="text-sm font-bold text-slate-900 dark:text-white">{row.description}</p>
                                            <span class="text-[10px] font-semibold uppercase tracking-tighter {row.transaction_type === 'credit' || row.transaction_type === 'topup' ? 'text-emerald-500' : 'text-red-500'}">
                                                {row.transaction_type}
                                            </span>
                                        </Table.Cell>
                                        <Table.Cell class="px-8 py-5 text-right">
                                            <span class="text-sm font-bold {row.transaction_type === 'credit' || row.transaction_type === 'topup' ? 'text-emerald-500' : 'text-red-500'}">
                                                {row.transaction_type === 'credit' || row.transaction_type === 'topup' ? '+' : ''}Rp {row.amount.toLocaleString('id-ID')}
                                            </span>
                                        </Table.Cell>
                                        <Table.Cell class="px-8 py-5 text-right font-mono text-sm font-bold text-slate-600 dark:text-slate-300">
                                            Rp {row.balance_after.toLocaleString('id-ID')}
                                        </Table.Cell>
                                        <Table.Cell class="px-8 py-5 text-right text-[11px] font-bold text-slate-400 uppercase">
                                            {new Date(row.created_at).toLocaleString('id-ID')}
                                        </Table.Cell>
                                    </Table.Row>
                                {/each}
                            {:else}
                                <Table.Row>
                                    <Table.Cell colspan={5} class="text-center py-8 text-slate-500">
                                        No wallet transactions found.
                                    </Table.Cell>
                                </Table.Row>
                            {/if}
                        </Table.Body>
                    </Table.Root>
                </div>
            </div>
		</TabsContent>
	</Tabs>
	</div>
</div>

<!-- Document Viewer Dialog -->
<Dialog.Root bind:open={isDialogOpen}>
	<Dialog.Content class="!w-[80vw] !h-[80vh] !max-w-none p-0 gap-0">
		<Dialog.Header class="p-6 border-b border-slate-200 dark:border-slate-800">
			<Dialog.Title class="flex items-center gap-3">
				{#if dialogDoc?.icon}
					{@const Icon = dialogDoc.icon}
					<Icon class="h-5 w-5 text-primary" />
				{/if}
				{dialogDoc?.name || 'Document Preview'}
			</Dialog.Title>
			<Dialog.Description class="text-xs text-slate-500">
				Status: {dialogDoc?.status || 'Unknown'}
			</Dialog.Description>
		</Dialog.Header>

		<div class="flex-1 flex flex-col lg:flex-row overflow-hidden">
			<!-- Left: Image Viewer -->
			<div class="flex-1 flex flex-col overflow-hidden">
				<!-- Zoom Controls -->
				<div class="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
					<div class="flex items-center gap-2">
						<ImageIcon class="h-4 w-4 text-slate-400" />
						<span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Preview</span>
					</div>
					<div class="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
						<Button variant="ghost" size="icon" class="h-8 w-8" onclick={() => setZoom(zoom - 10)}>
							<ZoomOut class="h-4 w-4" />
						</Button>
						<span class="text-[10px] font-bold px-2 w-12 text-center text-slate-500">{zoom}%</span>
						<Button variant="ghost" size="icon" class="h-8 w-8" onclick={() => setZoom(zoom + 10)}>
							<ZoomIn class="h-4 w-4" />
						</Button>
					</div>
				</div>

				<!-- Image Viewer -->
				<div 
					class="flex-1 bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden relative {isDragging ? 'cursor-grabbing' : 'cursor-grab'}"
					onwheel={handleWheel}
					onmousedown={handleMouseDown}
					onmousemove={handleMouseMove}
					onmouseup={handleMouseUp}
					onmouseleave={handleMouseUp}
					role="presentation"
				>
					<div
						class="transition-transform duration-75 ease-out"
						style="transform: translate({pan.x}px, {pan.y}px) scale({zoom / 100})"
					>
						{#if dialogDoc?.url}
							<img 
								src={dialogDoc.url} 
								alt={dialogDoc.name} 
								class="max-w-[60vw] max-h-[70vh] object-contain rounded shadow-2xl"
								draggable="false"
							/>
						{:else}
							<div class="bg-white dark:bg-slate-800 rounded-2xl p-12 shadow-2xl border border-slate-200 dark:border-slate-700">
								<div class="flex flex-col items-center justify-center gap-4">
									{#if dialogDoc?.icon}
										{@const Icon = dialogDoc.icon}
										<Icon class="h-24 w-24 text-slate-300" />
									{/if}
									<p class="text-sm font-bold text-slate-400">No document available</p>
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Right: Document Info Panel -->
			<div class="w-full lg:w-80 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto">
				<div class="p-6 space-y-6">
					<div>
						<h3 class="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Document Information</h3>
						
						{#if dialogDoc?.id === 'KTP'}
							<div class="space-y-4">
								<div>
									<p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
									<p class="text-sm font-bold text-slate-900 dark:text-white">{driver.name}</p>
								</div>
								<div>
									<p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
									<p class="text-sm font-bold text-slate-900 dark:text-white">{driver.phone}</p>
								</div>
								<div>
									<p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Address</p>
									<p class="text-sm font-bold text-slate-900 dark:text-white">{driver.address}</p>
								</div>
							</div>
						{:else if dialogDoc?.id === 'SIM'}
							<div class="space-y-4">
								<div>
									<p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">License Number</p>
									<p class="text-sm font-bold text-slate-900 dark:text-white">{driverDetailData?.driver.license_number || 'N/A'}</p>
								</div>
								<div>
									<p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Driver Name</p>
									<p class="text-sm font-bold text-slate-900 dark:text-white">{driver.name}</p>
								</div>
								<div>
									<p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Joined Date</p>
									<p class="text-sm font-bold text-slate-900 dark:text-white">{driver.joined}</p>
								</div>
							</div>
						{:else if dialogDoc?.id === 'STNK'}
							<div class="space-y-4">
								<div>
									<p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Vehicle Model</p>
									<p class="text-sm font-bold text-slate-900 dark:text-white">{driver.vehicle}</p>
								</div>
								<div>
									<p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Plate Number</p>
									<p class="text-sm font-bold text-slate-900 dark:text-white">{driver.plate}</p>
								</div>
								<div>
									<p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Color</p>
									<div class="flex items-center gap-2">
										<div class="size-3 rounded-full bg-slate-900 border border-slate-700"></div>
										<p class="text-sm font-bold text-slate-900 dark:text-white">{driver.color}</p>
									</div>
								</div>
							</div>
						{:else if dialogDoc?.id === 'SKCK'}
							<div class="space-y-4">
								<div>
									<p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Driver Name</p>
									<p class="text-sm font-bold text-slate-900 dark:text-white">{driver.name}</p>
								</div>
								<div>
									<p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Status</p>
									<Badge variant={driverDetailData?.driver.status === 'approved' ? 'default' : driverDetailData?.driver.status === 'rejected' ? 'destructive' : 'secondary'}>
										{driverDetailData?.driver.status}
									</Badge>
								</div>
								<div>
									<p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">Joined Date</p>
									<p class="text-sm font-bold text-slate-900 dark:text-white">{driver.joined}</p>
								</div>
							</div>
						{/if}
					</div>

					<div class="pt-4 border-t border-slate-200 dark:border-slate-700">
						<p class="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">Verification Status</p>
						<Badge variant={dialogDoc?.status === 'Verified' ? 'default' : 'secondary'}>
							{dialogDoc?.status}
						</Badge>
					</div>
				</div>
			</div>
		</div>

	</Dialog.Content>
</Dialog.Root>
