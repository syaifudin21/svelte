<script lang="ts">

  import { onMount } from "svelte";
  import { driverStore } from "$lib/stores/driver.svelte";
  import * as Card from "$lib/components/ui/card";
  import * as Avatar from "$lib/components/ui/avatar";
  import { Badge } from "$lib/components/ui/badge";
  import { Button } from "$lib/components/ui/button";
  import { Separator } from "$lib/components/ui/separator";
  import {
    User,
    Phone,
    MapPin,
    CreditCard,
    Car,
    FileText,
    Star,
    Calendar,
    Activity,
    DollarSign,
    Box,
  } from "lucide-svelte";

  import * as Dialog from "$lib/components/ui/dialog";
  import { Textarea } from "$lib/components/ui/textarea";

  let { uuid } = $props<{ uuid: string }>();
  let showRejectDialog = $state(false);
  let showApproveDialog = $state(false);
  let rejectNotes = $state("");
  let isSubmitting = $state(false);

  $effect(() => {
    if (uuid) {
      driverStore.fetchDriverDetail(uuid);
    }
  });

  const { driverDetail, isLoading, error } = $derived(driverStore);

  async function handleApprove() {
    isSubmitting = true;
    const success = await driverStore.approveDriver(uuid);
    isSubmitting = false;
    if (success) {
        showApproveDialog = false;
    }
  }

  async function handleReject() {
     if (!rejectNotes.trim()) return;
     isSubmitting = true;
     const notes = rejectNotes.split('\n').filter(n => n.trim() !== '');
     const success = await driverStore.rejectDriver(uuid, notes);
     isSubmitting = false;
     if (success) {
         showRejectDialog = false;
         rejectNotes = "";
     }
  }
</script>

<div class="space-y-6">
  {#if isLoading}
    <div class="flex h-96 items-center justify-center">
      <div class="text-muted-foreground">Loading driver details...</div>
    </div>
  {:else if error}
    <div class="flex h-96 items-center justify-center">
      <div class="text-destructive">{error}</div>
    </div>
  {:else if driverDetail}
    <div class="flex justify-between items-center">
        <h2 class="text-3xl font-bold tracking-tight">Driver Details</h2>
        {#if driverDetail.driver.status === 'submitted'}
            <div class="flex gap-2">
                <Dialog.Root bind:open={showRejectDialog}>
                    <Dialog.Trigger>
                        <Button variant="destructive">Reject</Button>
                    </Dialog.Trigger>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Reject Driver</Dialog.Title>
                            <Dialog.Description>
                                Please provide reasons for rejecting this driver.
                            </Dialog.Description>
                        </Dialog.Header>
                        <div class="space-y-4 py-4">
                            <Textarea 
                                placeholder="Enter rejection notes (one per line)" 
                                bind:value={rejectNotes}
                                rows={5}
                            />
                        </div>
                        <Dialog.Footer>
                            <Button variant="outline" onclick={() => showRejectDialog = false}>Cancel</Button>
                            <Button variant="destructive" onclick={handleReject} disabled={isSubmitting || !rejectNotes.trim()}>
                                {isSubmitting ? 'Rejecting...' : 'Confirm Reject'}
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Root>

                <Dialog.Root bind:open={showApproveDialog}>
                    <Dialog.Trigger>
                         <Button variant="default">Approve</Button>
                    </Dialog.Trigger>
                     <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>Approve Driver</Dialog.Title>
                            <Dialog.Description>
                                Are you sure you want to approve this driver?
                            </Dialog.Description>
                        </Dialog.Header>
                        <Dialog.Footer>
                             <Button variant="outline" onclick={() => showApproveDialog = false}>Cancel</Button>
                            <Button onclick={handleApprove} disabled={isSubmitting}>
                                {isSubmitting ? 'Approving...' : 'Confirm Approve'}
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Root>
            </div>
        {/if}
    </div>

    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <!-- Left Column: Profile & Status -->
      <div class="space-y-6 md:col-span-1">
        <Card.Root>
          <Card.Header class="text-center">
            <div class="mx-auto mb-4">
              <Avatar.Root class="h-24 w-24">
                <Avatar.Image
                  src={driverDetail.driver.image_url ?? ""}
                  alt={driverDetail.driver.full_name}
                />
                <Avatar.Fallback>{driverDetail.driver.full_name.substring(0, 2).toUpperCase()}</Avatar.Fallback>
              </Avatar.Root>
            </div>
            <Card.Title>{driverDetail.driver.full_name}</Card.Title>
            <Card.Description>{driverDetail.user.email}</Card.Description>
            <div class="mt-2 flex justify-center">
                <Badge variant={driverDetail.driver.status === 'approved' ? 'default' : 'secondary'}>
                    {driverDetail.driver.status}
                </Badge>
            </div>
          </Card.Header>
          <Card.Content class="space-y-4">
            <div class="flex items-center gap-2 text-sm">
                <Phone class="h-4 w-4 text-muted-foreground" />
                <span>{driverDetail.driver.phone_number}</span>
            </div>
            <div class="flex items-center gap-2 text-sm">
                <MapPin class="h-4 w-4 text-muted-foreground" />
                <span>{driverDetail.driver.address}</span>
            </div>
             <div class="flex items-center gap-2 text-sm">
                <Calendar class="h-4 w-4 text-muted-foreground" />
                <span>Joined {new Date(driverDetail.driver.joined_at).toLocaleDateString()}</span>
            </div>
          </Card.Content>
        </Card.Root>

        <Card.Root>
            <Card.Header>
                <Card.Title>Summary</Card.Title>
            </Card.Header>
            <Card.Content class="space-y-4">
                 <div class="flex justify-between items-center">
                    <div class="flex items-center gap-2">
                         <Box class="h-4 w-4 text-muted-foreground" />
                         <span class="text-sm font-medium">Total Orders</span>
                    </div>
                    <span>{driverDetail.summary.total_orders}</span>
                 </div>
                 <div class="flex justify-between items-center">
                    <div class="flex items-center gap-2">
                         <DollarSign class="h-4 w-4 text-muted-foreground" />
                         <span class="text-sm font-medium">Revenue</span>
                    </div>
                     <span>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(driverDetail.summary.total_revenue)}</span>
                 </div>
                 <div class="flex justify-between items-center">
                    <div class="flex items-center gap-2">
                         <Activity class="h-4 w-4 text-muted-foreground" />
                         <span class="text-sm font-medium">Distance</span>
                    </div>
                     <span>{driverDetail.summary.total_distance} km</span>
                 </div>
                  <div class="flex justify-between items-center">
                    <div class="flex items-center gap-2">
                         <Star class="h-4 w-4 text-muted-foreground" />
                         <span class="text-sm font-medium">Rating</span>
                    </div>
                     <span>{driverDetail.rating.average} ({driverDetail.rating.total} reviews)</span>
                 </div>
            </Card.Content>
        </Card.Root>
      </div>

      <!-- Right Column: Details -->
      <div class="space-y-6 md:col-span-2">
        <Card.Root>
            <Card.Header>
                <Card.Title>Vehicle Information</Card.Title>
            </Card.Header>
            <Card.Content class="grid grid-cols-2 gap-4">
                <div>
                    <span class="text-sm text-muted-foreground">Vehicle Brand</span>
                    <p class="font-medium">{driverDetail.driver.vehicle_brand}</p>
                </div>
                 <div>
                    <span class="text-sm text-muted-foreground">Vehicle Model</span>
                    <p class="font-medium">{driverDetail.driver.vehicle_model}</p>
                </div>
                 <div>
                    <span class="text-sm text-muted-foreground">Vehicle Year</span>
                    <p class="font-medium">{driverDetail.driver.vehicle_year}</p>
                </div>
                <div>
                    <span class="text-sm text-muted-foreground">Plate Number</span>
                    <p class="font-medium">{driverDetail.driver.plate_number}</p>
                </div>
                 <div>
                    <span class="text-sm text-muted-foreground">Color</span>
                    <p class="font-medium">{driverDetail.driver.color}</p>
                </div>
                 <div>
                    <span class="text-sm text-muted-foreground">Service Type</span>
                    <p class="font-medium">{driverDetail.service?.name ?? "-"}</p>
                </div>
            </Card.Content>
        </Card.Root>

        <Card.Root>
             <Card.Header>
                <Card.Title>Documents</Card.Title>
            </Card.Header>
            <Card.Content class="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {#each [
                    { label: 'KTP', url: driverDetail.driver.ktp_url },
                    { label: 'SIM', url: driverDetail.driver.sim_url },
                    { label: 'STNK', url: driverDetail.driver.stnk_url },
                    { label: 'SKCK', url: driverDetail.driver.skck_url },
                    { label: 'Selfie with KTP', url: driverDetail.driver.selfie_with_ktp_url },
                    { label: 'Vehicle Photo', url: driverDetail.driver.vehicle_photo_url },
                    { label: 'Domicile Letter', url: driverDetail.driver.domicile_url }
                 ] as doc}
                    {#if doc.url}
                        <div class="border rounded-lg p-2">
                            <span class="text-sm font-medium block mb-2">{doc.label}</span>
                             <div class="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
                                <img
                                    src={doc.url}
                                    alt={doc.label}
                                    class="h-full w-full object-cover"
                                />
                            </div>
                             <Button variant="link" size="sm" class="mt-1 h-auto p-0" href={doc.url} target="_blank">View Original</Button>
                        </div>
                    {/if}
                 {/each}
            </Card.Content>
        </Card.Root>

         <Card.Root>
            <Card.Header>
                <Card.Title>Bank Information</Card.Title>
            </Card.Header>
            <Card.Content class="grid grid-cols-2 gap-4">
                 <div>
                    <span class="text-sm text-muted-foreground">Bank Name</span>
                    <p class="font-medium">{driverDetail.driver.bank_name ?? "-"}</p>
                </div>
                 <div>
                    <span class="text-sm text-muted-foreground">Account Number</span>
                    <p class="font-medium">{driverDetail.driver.account_number ?? "-"}</p>
                </div>
                 <div>
                    <span class="text-sm text-muted-foreground">Account Holder</span>
                    <p class="font-medium">{driverDetail.driver.account_holder_name ?? "-"}</p>
                </div>
            </Card.Content>
        </Card.Root>
      </div>
    </div>
  {/if}
</div>
