<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Accordion from "$lib/components/ui/accordion/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import { Search, HelpCircle, User, CreditCard, Car, ShieldCheck, Package, ShoppingBag, Ticket, UserCheck, Settings } from "lucide-svelte";
  import { helpStore } from "$lib/stores/help.svelte";
  import type { FAQ } from "$lib/types/help";
  import { onMount } from "svelte";

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
    await helpStore.init();
  });
</script>

<div class="flex flex-col gap-8 pb-10">
  <!-- Header & Search -->
  <div class="flex flex-col items-center gap-4 text-center">
    <h1 class="text-3xl font-bold tracking-tight">Pusat Bantuan Merchant</h1>
    <p class="text-muted-foreground max-w-2xl">
      Temukan jawaban untuk pertanyaan seputar merchant, pendaftaran, dan pengelolaan bisnis Anda
    </p>
    <div class="relative w-full max-w-2xl">
      <Search
        class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        placeholder="Cari bantuan (misal: pendaftaran, verifikasi, pembayaran)..."
        class="pl-10 h-12 text-lg"
        bind:value={helpStore.searchQuery}
        oninput={() => helpStore.searchHelp(helpStore.searchQuery)}
      />
      {#if helpStore.isSearching}
        <div class="absolute right-3 top-1/2 size-4 -translate-y-1/2">
          <div
            class="animate-spin rounded-full border-2 border-primary border-t-transparent size-4"
          ></div>
        </div>
      {/if}
    </div>
  </div>

  <!-- Categories -->
  <div>
    <h2 class="text-xl font-semibold mb-4">Kategori Bantuan</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each helpStore.categories as item}
        {@const Icon = iconMap[item.icon] || HelpCircle}
        <button
          onclick={() => helpStore.selectCategory(item.id)}
          class="text-left w-full h-full"
        >
          <Card.Root
            class="h-full hover:border-primary cursor-pointer transition-colors {helpStore.selectedCategory ===
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
  </div>

  <!-- FAQ Section -->
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-semibold">
        {#if helpStore.searchQuery}
          Hasil Pencarian untuk "{helpStore.searchQuery}"
        {:else if helpStore.selectedCategory}
          {helpStore.categories.find((c) => c.id === helpStore.selectedCategory)?.name}
        {:else}
          Pertanyaan Umum (FAQ)
        {/if}
      </h2>
    </div>

    {#if helpStore.isLoading}
      <div
        class="flex items-center justify-center py-10 text-muted-foreground"
      >
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p class="ml-3">Memuat bantuan...</p>
      </div>
    {:else if helpStore.faqs.length > 0}
      <Accordion.Root type="single" class="w-full">
        {#each helpStore.faqs as faq, i}
          <Accordion.Item value="item-{i}">
            <Accordion.Trigger class="text-left">
              {faq.question}
            </Accordion.Trigger>
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
            helpStore.searchQuery = "";
            if (helpStore.categories.length > 0) helpStore.selectCategory(helpStore.categories[0].id);
          }}
        >
          Lihat semua kategori
        </Button>
      </div>
    {/if}
  </div>
</div>
