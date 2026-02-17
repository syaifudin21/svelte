<script lang="ts">
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import * as Card from "$lib/components/ui/card";
  import * as Table from "$lib/components/ui/table";
  import { Badge } from "$lib/components/ui/badge";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import { Label } from "$lib/components/ui/label";
  import * as Tabs from "$lib/components/ui/tabs";
  import MerchantRejectDialog from "$lib/components/merchant-reject-dialog.svelte";
  import MerchantMap from "$lib/components/merchant-map.svelte";
  import { merchantService } from "$lib/services/merchant.service";
  import type { MerchantDetail } from "$lib/types/merchant";
  import { onMount } from "svelte";
  import {
    Store,
    User,
    Mail,
    Shield,
    Star,
    Tag,
    MapPin,
    Package,
    ArrowLeft,
    RefreshCw,
    CheckCircle,
    XCircle,
    Info,
    Phone,
    CreditCard,
    Clock,
    Images,
    FileText,
    Calendar,
  } from "lucide-svelte";
  import { toast } from "svelte-sonner";

  interface Props {
    uuid: string;
  }

  let { uuid }: Props = $props();

  let detail = $state<MerchantDetail | null>(null);
  let loading = $state(true);

  async function loadDetail() {
    loading = true;
    try {
      const res = await merchantService.getMerchantDetail(uuid);
      detail = res.data;
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Gagal memuat detail merchant",
      );
    } finally {
      loading = false;
    }
  }

  async function handleApprove() {
    loading = true;
    try {
      await merchantService.approveMerchant(uuid);
      toast.success("Merchant telah disetujui.");
      await loadDetail();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Gagal menyetujui merchant");
      loading = false;
    }
  }

  function getStatusVariant(status: string) {
    switch (status) {
      case "online":
        return "default";
      case "offline":
        return "secondary";
      case "submitted":
        return "outline";
      case "approved":
        return "default";
      case "rejected":
        return "destructive";
      default:
        return "outline";
    }
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  }

  onMount(loadDetail);
</script>

<div class="flex flex-col gap-6 p-6">
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4">
      <Button variant="outline" size="icon" onclick={() => history.back()}>
        <ArrowLeft class="h-4 w-4" />
      </Button>
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Detail Merchant</h1>
        <p class="text-muted-foreground">
          Kelola profil dan produk merchant ini.
        </p>
      </div>
    </div>
    <div class="flex items-center gap-3">
      {#if detail && detail.merchant.status === "submitted"}
        <div class="flex items-center gap-2 mr-4 border-r pr-4">
          <AlertDialog.Root>
            <AlertDialog.Trigger
              class={buttonVariants({
                variant: "default",
                class: "gap-2 bg-green-600 hover:bg-green-700",
              })}
              disabled={loading}
            >
              <CheckCircle class="h-4 w-4" />
              Approve
            </AlertDialog.Trigger>
            <AlertDialog.Content>
              <AlertDialog.Header>
                <AlertDialog.Title>Konfirmasi Persetujuan</AlertDialog.Title>
                <AlertDialog.Description>
                  Apakah Anda yakin ingin menyetujui merchant <strong
                    >{detail.merchant.store_name}</strong
                  >? Tindakan ini tidak dapat dibatalkan.
                </AlertDialog.Description>
              </AlertDialog.Header>
              <AlertDialog.Footer>
                <AlertDialog.Cancel>Batal</AlertDialog.Cancel>
                <AlertDialog.Action onclick={handleApprove}
                  >Lanjutkan</AlertDialog.Action
                >
              </AlertDialog.Footer>
            </AlertDialog.Content>
          </AlertDialog.Root>
          <MerchantRejectDialog {uuid} onSuccess={loadDetail} />
        </div>
      {/if}
      {#if detail}
        <div class="flex items-center gap-2">
          <Badge
            variant={getStatusVariant(detail.merchant.status)}
            class="px-4 py-1 text-sm uppercase"
          >
            {detail.merchant.status}
          </Badge>

          {#if detail.merchant.status === "rejected" && detail.merchant.reject_notes && detail.merchant.reject_notes.length > 0}
            <AlertDialog.Root>
              <AlertDialog.Trigger
                class={buttonVariants({
                  variant: "ghost",
                  size: "icon",
                  class: "h-8 w-8 text-destructive hover:bg-destructive/10",
                })}
                disabled={loading}
              >
                <Info class="h-4 w-4" />
              </AlertDialog.Trigger>
              <AlertDialog.Content>
                <AlertDialog.Header>
                  <AlertDialog.Title class="flex items-center gap-2">
                    <XCircle class="h-5 w-5 text-destructive" />
                    Alasan Penolakan
                  </AlertDialog.Title>
                  <AlertDialog.Description>
                    Berikut adalah alasan mengapa pendaftaran merchant ini
                    ditolak:
                  </AlertDialog.Description>
                </AlertDialog.Header>
                <div class="py-4">
                  <ul class="list-disc list-inside space-y-2">
                    {#each detail.merchant.reject_notes as note}
                      <li class="text-sm">{note}</li>
                    {/each}
                  </ul>
                </div>
                <AlertDialog.Footer>
                  <AlertDialog.Cancel>Tutup</AlertDialog.Cancel>
                </AlertDialog.Footer>
              </AlertDialog.Content>
            </AlertDialog.Root>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  {#if loading}
    <div class="flex h-[400px] items-center justify-center">
      <RefreshCw class="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  {:else if detail}
    <Tabs.Root value="overview" class="w-full">
      <Tabs.List class="grid w-full grid-cols-4 lg:w-[600px] mb-6">
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="verification">Verification</Tabs.Trigger>
        <Tabs.Trigger value="products">Products</Tabs.Trigger>
        <Tabs.Trigger value="bank-hours">Bank & Hours</Tabs.Trigger>
      </Tabs.List>

      <Tabs.Content value="overview">
        <div class="grid gap-6 lg:grid-cols-3">
          <!-- Store Info -->
          <Card.Root class="lg:col-span-2">
            <Card.Header>
              <div class="flex items-center gap-3">
                <div class="rounded-full bg-primary/10 p-2 text-primary">
                  <Store class="h-5 w-5" />
                </div>
                <Card.Title>{detail.merchant.store_name}</Card.Title>
              </div>
              <Card.Description
                >Informasi profil toko dan pemilik.</Card.Description
              >
            </Card.Header>
            <Card.Content>
              <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-4">
                  <div class="flex items-center gap-3 text-sm">
                    <User class="h-4 w-4 text-muted-foreground" />
                    <span class="font-medium">Username:</span>
                    <span>{detail.user.username}</span>
                  </div>
                  <div class="flex items-center gap-3 text-sm">
                    <Mail class="h-4 w-4 text-muted-foreground" />
                    <span class="font-medium">Email:</span>
                    <span>{detail.user.email || "-"}</span>
                  </div>
                  <div class="flex items-center gap-3 text-sm">
                    <Shield class="h-4 w-4 text-muted-foreground" />
                    <span class="font-medium">Roles:</span>
                    <div class="flex flex-wrap gap-1">
                      {#each detail.user.roles as role}
                        <Badge
                          variant="secondary"
                          class="text-[10px] uppercase font-normal"
                          >{role}</Badge
                        >
                      {/each}
                    </div>
                  </div>
                </div>
                <div class="space-y-4">
                  <div class="flex items-center gap-3 text-sm">
                    <Tag class="h-4 w-4 text-muted-foreground" />
                    <span class="font-medium">Kategori:</span>
                    <Badge variant="outline">{detail.category.name}</Badge>
                  </div>
                  <div class="flex items-center gap-3 text-sm">
                    <Phone class="h-4 w-4 text-muted-foreground" />
                    <span class="font-medium">Telepon:</span>
                    <span>{detail.merchant.contact_phone || "-"}</span>
                  </div>
                  <div class="flex items-center gap-3 text-sm">
                    <Calendar class="h-4 w-4 text-muted-foreground" />
                    <span class="font-medium">Terdaftar:</span>
                    <span
                      >{new Date(detail.merchant.created_at).toLocaleDateString(
                        "id-ID",
                        { day: "numeric", month: "long", year: "numeric" },
                      )}</span
                    >
                  </div>
                </div>
              </div>
            </Card.Content>
          </Card.Root>

          <!-- Rating Summary -->
          <Card.Root>
            <Card.Header>
              <Card.Title>Rating & Ulasan</Card.Title>
              <Card.Description>Ringkasan performa merchant.</Card.Description>
            </Card.Header>
            <Card.Content
              class="flex flex-col items-center justify-center py-6"
            >
              <div class="flex items-baseline gap-2">
                <span class="text-5xl font-bold"
                  >{detail.rating.average.toFixed(1)}</span
                >
                <span class="text-muted-foreground">/ 5.0</span>
              </div>
              <div class="mt-2 flex items-center gap-1 text-yellow-500">
                {#each Array(5) as _, i}
                  <Star
                    class="h-5 w-5 {i < Math.round(detail.rating.average)
                      ? 'fill-current'
                      : 'text-muted'}"
                  />
                {/each}
              </div>
              <p class="mt-4 text-sm text-muted-foreground">
                Total {detail.rating.total} ulasan
              </p>
            </Card.Content>
          </Card.Root>

          <!-- Location Card (Embedded in Overview) -->
          <Card.Root class="lg:col-span-3">
            <Card.Header>
              <div class="flex items-center gap-3">
                <div class="rounded-full bg-primary/10 p-2 text-primary">
                  <MapPin class="h-5 w-5" />
                </div>
                <Card.Title>Lokasi Toko</Card.Title>
              </div>
              <Card.Description>{detail.merchant.address}</Card.Description>
            </Card.Header>
            <Card.Content>
              <div class="aspect-[21/9] w-full min-h-[300px]">
                <MerchantMap
                  lat={detail.merchant.latitude}
                  lng={detail.merchant.longitude}
                  storeName={detail.merchant.store_name}
                />
              </div>
            </Card.Content>
          </Card.Root>
        </div>
      </Tabs.Content>

      <Tabs.Content value="verification">
        <div class="grid gap-6">
          <!-- Legal & Identity -->
          <Card.Root>
            <Card.Header>
              <div class="flex items-center gap-3">
                <div class="rounded-full bg-primary/10 p-2 text-primary">
                  <FileText class="h-5 w-5" />
                </div>
                <Card.Title>Verifikasi Identitas</Card.Title>
              </div>
              <Card.Description
                >Dokumen legal dan identitas pemilik.</Card.Description
              >
            </Card.Header>
            <Card.Content>
              <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <div class="space-y-4">
                  <Label
                    class="text-xs font-semibold uppercase text-muted-foreground tracking-wider"
                    >Nomor KTP</Label
                  >
                  <p class="text-2xl font-mono tracking-tighter">
                    {detail.merchant.id_card_number}
                  </p>
                </div>
                <div class="space-y-3">
                  <Label
                    class="text-xs font-semibold uppercase text-muted-foreground tracking-wider"
                    >Foto KTP</Label
                  >
                  <img
                    src={detail.merchant.id_card_image_url}
                    alt="KTP"
                    class="aspect-video w-full cursor-zoom-in rounded-xl border-2 shadow-sm object-cover hover:opacity-90 transition-opacity"
                  />
                </div>
                <div class="space-y-3">
                  <Label
                    class="text-xs font-semibold uppercase text-muted-foreground tracking-wider"
                    >Selfie + KTP</Label
                  >
                  <img
                    src={detail.merchant.selfie_image_url}
                    alt="Selfie"
                    class="aspect-video w-full cursor-zoom-in rounded-xl border-2 shadow-sm object-cover hover:opacity-90 transition-opacity"
                  />
                </div>
              </div>
            </Card.Content>
          </Card.Root>

          <!-- Store Photos -->
          <Card.Root>
            <Card.Header>
              <div class="flex items-center gap-3">
                <div class="rounded-full bg-primary/10 p-2 text-primary">
                  <Images class="h-5 w-5" />
                </div>
                <Card.Title>Foto Tempat Usaha</Card.Title>
              </div>
              <Card.Description
                >Foto fisik toko atau tempat usaha merchant.</Card.Description
              >
            </Card.Header>
            <Card.Content>
              <div class="grid gap-6 md:grid-cols-2">
                <div class="space-y-3">
                  <Label
                    class="text-xs font-semibold uppercase text-muted-foreground tracking-wider"
                    >Tampak Depan</Label
                  >
                  <img
                    src={detail.merchant.store_front_image_url}
                    alt="Toko Depan"
                    class="aspect-video w-full rounded-xl border-2 shadow-sm object-cover hover:opacity-90 transition-opacity"
                  />
                </div>
                <div class="space-y-3">
                  <Label
                    class="text-xs font-semibold uppercase text-muted-foreground tracking-wider"
                    >Tampak Dalam</Label
                  >
                  <img
                    src={detail.merchant.store_inside_image_url}
                    alt="Toko Dalam"
                    class="aspect-video w-full rounded-xl border-2 shadow-sm object-cover hover:opacity-90 transition-opacity"
                  />
                </div>
              </div>
            </Card.Content>
          </Card.Root>
        </div>
      </Tabs.Content>

      <Tabs.Content value="products">
        <Card.Root>
          <Card.Header class="flex flex-row items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="rounded-full bg-primary/10 p-2 text-primary">
                <Package class="h-5 w-5" />
              </div>
              <div>
                <Card.Title>Manajemen Produk</Card.Title>
                <Card.Description
                  >Katalog produk yang terdaftar untuk merchant ini.</Card.Description
                >
              </div>
            </div>
            <Badge variant="outline" class="font-semibold"
              >{detail.products.length} Items</Badge
            >
          </Card.Header>
          <Card.Content>
            {#if detail.products.length > 0}
              <Table.Root>
                <Table.Header>
                  <Table.Row>
                    <Table.Head class="w-[100px]">Thumbnail</Table.Head>
                    <Table.Head>Nama Produk</Table.Head>
                    <Table.Head>Deskripsi</Table.Head>
                    <Table.Head class="text-right">Harga Satuan</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {#each detail.products as product}
                    <Table.Row class="group">
                      <Table.Cell>
                        <img
                          src={product.image.startsWith("http")
                            ? product.image
                            : `http://localhost:8000${product.image}`}
                          alt={product.name}
                          class="h-12 w-12 rounded-lg object-cover border shadow-sm group-hover:scale-105 transition-transform"
                        />
                      </Table.Cell>
                      <Table.Cell
                        class="font-semibold underline-offset-4 group-hover:underline"
                        >{product.name}</Table.Cell
                      >
                      <Table.Cell
                        class="text-sm text-muted-foreground max-w-[500px] truncate italic"
                      >
                        "{product.description}"
                      </Table.Cell>
                      <Table.Cell class="text-right font-bold text-primary">
                        {formatCurrency(product.price)}
                      </Table.Cell>
                    </Table.Row>
                  {/each}
                </Table.Body>
              </Table.Root>
            {:else}
              <div
                class="flex h-[300px] flex-col items-center justify-center text-muted-foreground"
              >
                <Package class="h-12 w-12 mb-4 opacity-20" />
                <p class="text-lg">Katalog produk masih kosong.</p>
              </div>
            {/if}
          </Card.Content>
        </Card.Root>
      </Tabs.Content>

      <Tabs.Content value="bank-hours">
        <div class="grid gap-6 lg:grid-cols-2">
          <!-- Bank Card -->
          <Card.Root>
            <Card.Header>
              <div class="flex items-center gap-3">
                <div class="rounded-full bg-primary/10 p-2 text-primary">
                  <CreditCard class="h-5 w-5" />
                </div>
                <Card.Title>Informasi Pembayaran</Card.Title>
              </div>
              <Card.Description
                >Rekening bank untuk pencairan dana merchant.</Card.Description
              >
            </Card.Header>
            <Card.Content>
              <div class="space-y-4">
                <Label
                  class="text-xs font-semibold uppercase text-muted-foreground"
                  >Data Tabungan</Label
                >
                <div
                  class="rounded-2xl border-2 border-dashed bg-muted/30 p-6 relative overflow-hidden"
                >
                  <div class="absolute top-0 right-0 p-4 opacity-10">
                    <CreditCard class="h-16 w-16" />
                  </div>
                  <p class="text-xl font-black text-primary tracking-widest">
                    {detail.merchant.bank_code}
                  </p>
                  <p class="text-2xl font-mono mt-2">
                    {detail.merchant.account_number}
                  </p>
                  <p
                    class="text-sm text-muted-foreground uppercase mt-4 border-t pt-4 font-bold"
                  >
                    {detail.merchant.account_holder_name}
                  </p>
                </div>
              </div>
            </Card.Content>
          </Card.Root>

          <!-- Hours Card -->
          <Card.Root>
            <Card.Header>
              <div class="flex items-center gap-3">
                <div class="rounded-full bg-primary/10 p-2 text-primary">
                  <Clock class="h-5 w-5" />
                </div>
                <Card.Title>Jam Operasional</Card.Title>
              </div>
              <Card.Description
                >Waktu buka dan tutup toko setiap harinya.</Card.Description
              >
            </Card.Header>
            <Card.Content>
              <div class="space-y-1">
                {#each Object.entries(detail.merchant.operation_hours) as [day, hours]}
                  <div
                    class="flex justify-between items-center border-b border-muted py-3 px-2 hover:bg-muted/20 transition-colors rounded-md last:border-0"
                  >
                    <span class="capitalize font-bold text-sm">{day}</span>
                    <div class="flex items-center gap-2">
                      <Badge variant="secondary" class="font-mono"
                        >{hours.open}</Badge
                      >
                      <span class="text-muted-foreground">-</span>
                      <Badge variant="secondary" class="font-mono"
                        >{hours.close}</Badge
                      >
                    </div>
                  </div>
                {/each}
              </div>
            </Card.Content>
          </Card.Root>
        </div>
      </Tabs.Content>
    </Tabs.Root>
  {:else}
    <div class="flex h-[400px] flex-col items-center justify-center gap-4">
      <p class="text-muted-foreground">Merchant tidak ditemukan.</p>
      <Button onclick={() => history.back()}>Kembali</Button>
    </div>
  {/if}
</div>
