<script lang="ts">
  import * as Card from "$lib/components/ui/card/index.js";
  import * as Accordion from "$lib/components/ui/accordion/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";
  import { Textarea } from "$lib/components/ui/textarea/index.js";
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
    Plus,
    Pencil,
    Trash2,
  } from "lucide-svelte";
  import { helpStore } from "$lib/stores/help.svelte";
  import type { HelpCategory, FAQ } from "$lib/types/help";
  import { onMount } from "svelte";

  // Dialog state
  let isDialogOpen = $state(false);
  let dialogMode = $state<"create" | "edit">("create");
  let editingCategoryId = $state<number | null>(null);
  let isSubmitting = $state(false);

  // Form state
  let formData = $state({
    name: "",
    slug: "",
    icon: "",
    description: "",
    display_order: 1,
    is_active: true,
  });

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

  function openCreateDialog(initialDisplayOrder: number) {
    dialogMode = "create";
    editingCategoryId = null;
    formData = {
      name: "",
      slug: "",
      icon: "help-circle",
      description: "",
      display_order: initialDisplayOrder + 1,
      is_active: true,
    };
    isDialogOpen = true;
  }

  function openEditDialog(category: HelpCategory, e: MouseEvent) {
    e.stopPropagation(); // Avoid selecting category when clicking edit
    dialogMode = "edit";
    editingCategoryId = category.id;
    formData = {
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      description: category.description,
      display_order: category.display_order,
      is_active: category.is_active,
    };
    isDialogOpen = true;
  }

  async function handleSubmit() {
    isSubmitting = true;
    try {
      if (dialogMode === "create") {
        await helpStore.createCategory(formData);
      } else if (editingCategoryId) {
        await helpStore.updateCategory(editingCategoryId, formData);
      }
      isDialogOpen = false;
    } catch (error) {
      console.error("Failed to save category:", error);
    } finally {
      isSubmitting = false;
    }
  }

  async function deleteCategory(id: number, e: MouseEvent) {
    e.stopPropagation();
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;

    try {
      await helpStore.deleteCategory(id);
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
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

  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold">Kategori Bantuan</h2>
    <Button onclick={() => openCreateDialog(helpStore.categories.length)} class="flex items-center gap-2">
      <Plus class="size-4" />
      Tambah Kategori
    </Button>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {#each helpStore.categories as item}
      {@const Icon = iconMap[item.icon] || HelpCircle}
      <div class="relative group">
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

        <div
          class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Button
            size="icon"
            variant="secondary"
            class="size-8"
            onclick={(e) => openEditDialog(item, e)}
          >
            <Pencil class="size-4" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            class="size-8"
            onclick={(e) => deleteCategory(item.id, e)}
          >
            <Trash2 class="size-4" />
          </Button>
        </div>
      </div>
    {/each}
  </div>

  <!-- Category Dialog -->
  <Dialog.Root bind:open={isDialogOpen}>
    <Dialog.Content class="sm:max-w-[500px]">
      <Dialog.Header>
        <Dialog.Title
          >{dialogMode === "create" ? "Tambah" : "Edit"} Kategori</Dialog.Title
        >
        <Dialog.Description>
          Isi detail kategori bantuan di bawah ini.
        </Dialog.Description>
      </Dialog.Header>

      <div class="grid gap-4 py-4">
        <div class="grid gap-2">
          <Label for="name">Nama Kategori</Label>
          <Input
            id="name"
            bind:value={formData.name}
            placeholder="Contoh: Akun & Keamanan"
          />
        </div>
        <div class="grid gap-2">
          <Label for="slug">Slug (URL)</Label>
          <Input
            id="slug"
            bind:value={formData.slug}
            placeholder="akun-keamanan"
          />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label for="icon">Icon (Lucide)</Label>
            <Input id="icon" bind:value={formData.icon} placeholder="user" />
          </div>
          <div class="grid gap-2">
            <Label for="order">Urutan Tampilan</Label>
            <Input
              id="order"
              type="number"
              bind:value={formData.display_order}
            />
          </div>
        </div>
        <div class="grid gap-2">
          <Label for="desc">Deskripsi</Label>
          <Textarea
            id="desc"
            bind:value={formData.description}
            placeholder="Berikan penjelasan singkat mengenai kategori ini..."
          />
        </div>
        <div class="flex items-center space-x-2 pt-2">
          <Checkbox id="status" bind:checked={formData.is_active} />
          <Label for="status">Aktif (Tampilkan di halaman utama)</Label>
        </div>
      </div>

      <Dialog.Footer>
        <Button variant="outline" onclick={() => (isDialogOpen = false)}
          >Batal</Button
        >
        <Button onclick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Menyimpan..." : "Simpan"}
        </Button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>

  <div class="flex flex-col gap-4">
    <!-- FAQ Section -->
    <div class="space-y-4">
      <h2 class="text-2xl font-semibold">
        {#if helpStore.searchQuery}
          Hasil Pencarian untuk "{helpStore.searchQuery}"
        {:else if helpStore.selectedCategory}
          {helpStore.categories.find((c) => c.id === helpStore.selectedCategory)?.name}
        {:else}
          Pertanyaan Umum (FAQ)
        {/if}
      </h2>

      {#if helpStore.isLoading}
        <div
          class="flex items-center justify-center py-10 text-muted-foreground"
        >
          Memuat bantuan...
        </div>
      {:else if helpStore.faqs.length > 0}
        <Accordion.Root type="single" class="w-full">
          {#each helpStore.faqs as faq, i}
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
</div>