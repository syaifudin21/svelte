<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Accordion from "$lib/components/ui/accordion/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import {
    Search,
    User,
    CreditCard,
    Car,
    ShieldCheck,
    Package,
    ShoppingBag,
    Ticket,
    UserCheck,
    Settings,
    HelpCircle,
  } from "lucide-svelte";
  import { helpService } from "$lib/services/help.service";
  import type { HelpCategory, FAQ } from "$lib/types/help";
  import { onMount } from "svelte";

  let categories = $state<HelpCategory[]>([]);
  let faqs = $state<FAQ[]>([]);
  let searchQuery = $state("");
  let selectedCategory = $state<number | null>(null);
  let isLoading = $state(true);
  let isSearching = $state(false);

  const iconMap: Record<string, any> = {
    user: User,
    car: Car,
    "credit-card": CreditCard,
    "shield-check": ShieldCheck,
    package: Package,
    "shopping-bag": ShoppingBag,
    ticket: Ticket,
    "user-check": UserCheck,
    settings: Settings,
  };

  onMount(async () => {
    try {
      const res = await helpService.getCategories();
      categories = res.data;
      // Fetch default FAQs (e.g., from first category) if needed
      if (categories.length > 0) {
        await selectCategory(categories[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch help categories:", error);
    } finally {
      isLoading = false;
    }
  });

  async function selectCategory(id: number) {
    selectedCategory = id;
    searchQuery = ""; // Clear search when selecting category
    isLoading = true;
    try {
      const res = await helpService.getFAQs(id);
      faqs = res.data;
    } catch (error) {
      console.error("Failed to fetch FAQs:", error);
    } finally {
      isLoading = false;
    }
  }

  let searchTimeout: any;
  function handleSearchInput() {
    isSearching = true;
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      if (searchQuery.trim().length === 0) {
        if (selectedCategory) await selectCategory(selectedCategory);
        isSearching = false;
        return;
      }

      try {
        const res = await helpService.searchHelp(searchQuery);
        faqs = res.data;
        selectedCategory = null; // Clear category selection on search
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        isSearching = false;
      }
    }, 500);
  }
</script>

<div class="flex flex-col gap-8 pb-10">
  <!-- Header & Search -->
  <div class="flex flex-col items-center gap-4 text-center">
    <h1 class="text-3xl font-bold tracking-tight">Ada yang bisa kami bantu?</h1>
    <div class="relative w-full max-w-2xl">
      <Search
        class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        placeholder="Cari bantuan (misal: perjalanan, akun, refund)..."
        class="pl-10 h-12 text-lg"
        bind:value={searchQuery}
        oninput={handleSearchInput}
      />
      {#if isSearching}
        <div class="absolute right-3 top-1/2 size-4 -translate-y-1/2">
          <div
            class="animate-spin rounded-full border-2 border-primary border-t-transparent size-4"
          ></div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Categories -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {#each categories as item}
      {@const Icon = iconMap[item.icon] || HelpCircle}
      <button onclick={() => selectCategory(item.id)} class="text-left">
        <Card.Root
          class="hover:border-primary cursor-pointer transition-colors {selectedCategory ===
          item.id
            ? 'border-primary bg-primary/5'
            : ''}"
        >
          <Card.Header>
            <div
              class="mb-2 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
            >
              <Icon class="size-6" />
            </div>
            <Card.Title class="text-lg">{item.name}</Card.Title>
            <Card.Description class="line-clamp-2"
              >{item.description}</Card.Description
            >
          </Card.Header>
        </Card.Root>
      </button>
    {/each}
  </div>

  <div class="flex flex-col gap-4">
    <!-- FAQ Section -->
    <div class="space-y-4">
      <h2 class="text-2xl font-semibold">
        {#if searchQuery}
          Hasil Pencarian untuk "{searchQuery}"
        {:else if selectedCategory}
          {categories.find((c) => c.id === selectedCategory)?.name}
        {:else}
          Pertanyaan Umum (FAQ)
        {/if}
      </h2>

      {#if isLoading}
        <div
          class="flex items-center justify-center py-10 text-muted-foreground"
        >
          Memuat bantuan...
        </div>
      {:else if faqs.length > 0}
        <Accordion.Root type="single" class="w-full">
          {#each faqs as faq, i}
            <Accordion.Item value="item-{i}">
              <Accordion.Trigger class="text-left"
                >{faq.question}</Accordion.Trigger
              >
              <Accordion.Content
                class="text-muted-foreground leading-relaxed whitespace-pre-line"
              >
                {faq.answer}
              </Accordion.Content>
            </Accordion.Item>
          {/each}
        </Accordion.Root>
      {:else}
        <div
          class="flex flex-col items-center justify-center py-10 text-center gap-2 border rounded-lg bg-muted/20"
        >
          <HelpCircle class="size-10 text-muted-foreground/50" />
          <p class="text-muted-foreground">
            Tidak ditemukan hasil bantuan untuk kueri Anda.
          </p>
          <Button
            variant="link"
            onclick={() => {
              searchQuery = "";
              if (categories.length > 0) selectCategory(categories[0].id);
            }}
          >
            Lihat semua kategori
          </Button>
        </div>
      {/if}
    </div>
  </div>
</div>
