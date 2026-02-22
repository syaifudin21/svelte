<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Textarea } from "$lib/components/ui/textarea";
  import { Trash2, Plus } from "lucide-svelte";
  import { merchantRegistrationStore } from "$lib/stores/merchant-registration.svelte";

  // Local type without merchant_uuid (will be added by store)
  type MenuItemInput = {
    name: string;
    description: string;
    price: number;
    category: string;
    is_available: boolean;
    image_url: string;
  };

  let { onSubmit, isLoading = false }: { onSubmit: (data: MenuItemInput[]) => Promise<void>; isLoading?: boolean } = $props();

  // Initialize with data from store if available
  let menuItems = $state<MenuItemInput[]>(
    merchantRegistrationStore.data.menu_items && merchantRegistrationStore.data.menu_items.length > 0
      ? merchantRegistrationStore.data.menu_items.map(item => ({
          name: item.name,
          description: item.description,
          price: item.price,
          category: item.category,
          is_available: item.is_available,
          image_url: item.image_url,
        }))
      : [
          {
            name: "",
            description: "",
            price: 0,
            category: "Makanan",
            is_available: true,
            image_url: "",
          },
        ]
  );

  let errors = $state<Record<number, Record<string, string>>>({});

  const categories = ["Makanan", "Minuman", "Snack", "Dessert", "Lainnya"];

  function addMenuItem() {
    menuItems = [
      ...menuItems,
      {
        name: "",
        description: "",
        price: 0,
        category: "Makanan",
        is_available: true,
        image_url: "",
      },
    ];
  }

  function removeMenuItem(index: number) {
    if (menuItems.length > 1) {
      menuItems = menuItems.filter((_, i) => i !== index);
      const { [index]: _, ...rest } = errors;
      errors = rest;
    }
  }

  function updateMenuItem(index: number, field: keyof MenuItemInput, value: any) {
    menuItems = menuItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    // Clear error when user types
    if (errors[index]?.[field]) {
      errors = { ...errors, [index]: { ...errors[index], [field]: "" } };
    }
  }

  function validateItem(index: number): boolean {
    const item = menuItems[index];
    const itemErrors: Record<string, string> = {};

    if (!item.name.trim()) {
      itemErrors.name = "Nama produk wajib diisi";
    }

    if (!item.description.trim()) {
      itemErrors.description = "Deskripsi wajib diisi";
    }

    if (!item.price || item.price < 1) {
      itemErrors.price = "Harga minimal 1";
    }

    if (!item.category.trim()) {
      itemErrors.category = "Kategori wajib diisi";
    }

    if (!item.image_url.trim()) {
      itemErrors.image_url = "URL gambar wajib diisi";
    } else {
      try {
        new URL(item.image_url);
      } catch {
        itemErrors.image_url = "URL gambar harus valid";
      }
    }

    errors[index] = itemErrors;
    return Object.keys(itemErrors).length === 0;
  }

  function validateAll(): boolean {
    let isValid = true;
    menuItems.forEach((_, index) => {
      if (!validateItem(index)) {
        isValid = false;
      }
    });
    return isValid;
  }

  async function handleSubmit() {
    if (validateAll()) {
      await onSubmit(menuItems);
    }
  }
</script>

<Card>
  <CardHeader>
    <CardTitle>Daftar Produk</CardTitle>
    <CardDescription>
      Tambahkan produk yang Anda jual (minimal 1 produk)
    </CardDescription>
  </CardHeader>
  <CardContent>
    <div class="space-y-4">
      {#each menuItems as item, index}
        <div class="border rounded-lg p-4 space-y-4 relative">
          {#if menuItems.length > 1}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="absolute top-2 right-2 text-destructive"
              onclick={() => removeMenuItem(index)}
              disabled={isLoading}
            >
              <Trash2 class="w-4 h-4" />
            </Button>
          {/if}

          <div class="font-medium">Produk #{index + 1}</div>

          <div class="space-y-2">
            <Label for="name_{index}">Nama Produk</Label>
            <Input
              id="name_{index}"
              type="text"
              placeholder="Contoh: Nasi Goreng Spesial"
              value={item.name}
              oninput={(e) => updateMenuItem(index, "name", e.currentTarget.value)}
              disabled={isLoading}
              class={errors[index]?.name ? "border-destructive" : ""}
            />
            {#if errors[index]?.name}
              <p class="text-sm text-destructive">{errors[index].name}</p>
            {/if}
          </div>

          <div class="space-y-2">
            <Label for="description_{index}">Deskripsi</Label>
            <Textarea
              id="description_{index}"
              placeholder="Deskripsi produk Anda"
              value={item.description}
              oninput={(e) => updateMenuItem(index, "description", e.currentTarget.value)}
              disabled={isLoading}
              rows="2"
              class={errors[index]?.description ? "border-destructive" : ""}
            />
            {#if errors[index]?.description}
              <p class="text-sm text-destructive">{errors[index].description}</p>
            {/if}
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="price_{index}">Harga (Rp)</Label>
              <Input
                id="price_{index}"
                type="number"
                placeholder="0"
                value={item.price}
                oninput={(e) => updateMenuItem(index, "price", Number(e.currentTarget.value))}
                disabled={isLoading}
                class={errors[index]?.price ? "border-destructive" : ""}
              />
              {#if errors[index]?.price}
                <p class="text-sm text-destructive">{errors[index].price}</p>
              {/if}
            </div>

            <div class="space-y-2">
              <Label for="category_{index}">Kategori</Label>
              <select
                id="category_{index}"
                value={item.category}
                onchange={(e) => updateMenuItem(index, "category", e.currentTarget.value)}
                disabled={isLoading}
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 {errors[index]?.category ? 'border-destructive' : ''}"
              >
                {#each categories as category}
                  <option value={category}>{category}</option>
                {/each}
              </select>
            </div>
          </div>

          <div class="space-y-2">
            <Label for="image_url_{index}">URL Gambar Produk</Label>
            <Input
              id="image_url_{index}"
              type="url"
              placeholder="https://example.com/product.jpg"
              value={item.image_url}
              oninput={(e) => updateMenuItem(index, "image_url", e.currentTarget.value)}
              disabled={isLoading}
              class={errors[index]?.image_url ? "border-destructive" : ""}
            />
            {#if errors[index]?.image_url}
              <p class="text-sm text-destructive">{errors[index].image_url}</p>
            {/if}
          </div>

          <div class="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_available_{index}"
              checked={item.is_available}
              onchange={(e) => updateMenuItem(index, "is_available", e.currentTarget.checked)}
              disabled={isLoading}
              class="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <Label for="is_available_{index}" class="cursor-pointer">Tersedia</Label>
          </div>
        </div>
      {/each}

      <Button
        type="button"
        variant="outline"
        class="w-full"
        onclick={addMenuItem}
        disabled={isLoading}
      >
        <Plus class="w-4 h-4 mr-2" />
        Tambah Produk Lain
      </Button>

      <div class="bg-muted/50 p-4 rounded-md">
        <p class="text-sm font-medium">Tips:</p>
        <ul class="text-sm text-muted-foreground list-disc list-inside mt-2">
          <li>Tambahkan minimal 1 produk untuk melanjutkan</li>
          <li>Gunakan gambar yang jelas dan menarik</li>
          <li>Pastikan harga sudah termasuk pajak jika ada</li>
          <li>Anda dapat menambah produk lagi setelah pendaftaran selesai</li>
        </ul>
      </div>

      <Button type="button" class="w-full" onclick={handleSubmit} disabled={isLoading}>
        {#if isLoading}
          <span class="animate-spin mr-2">⏳</span>
          Memproses...
        {:else}
          Lanjutkan
        {/if}
      </Button>
    </div>
  </CardContent>
</Card>
