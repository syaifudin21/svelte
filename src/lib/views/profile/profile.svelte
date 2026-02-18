<script lang="ts">
  import { onMount } from "svelte";
  import { authStore } from "$lib/stores/auth.svelte";
  import * as Card from "$lib/components/ui/card";
  import { Badge } from "$lib/components/ui/badge";
  import { User, Mail, Shield, Hash } from "lucide-svelte";

  onMount(async () => {
    if (!authStore.user) {
      await authStore.fetchProfile();
    }
  });

  function getRoles(roles: string[] | undefined) {
    if (!roles) return ["-"];
    return roles;
  }
</script>

<Card.Root class="col-span-2">
  <Card.Header>
    <Card.Title>User Information</Card.Title>
    <Card.Description>Your account details and roles.</Card.Description>
  </Card.Header>
  <Card.Content>
    {#if authStore.isLoading}
      <div class="flex justify-center p-8">
        <span class="loading loading-spinner loading-lg">Loading...</span>
      </div>
    {:else if authStore.user}
      <div class="grid gap-6">
        <div class="flex items-center gap-4">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"
          >
            <User class="h-6 w-6 text-primary" />
          </div>
          <div class="grid gap-1">
            <p class="text-sm font-medium leading-none text-muted-foreground">
              Username
            </p>
            <p class="text-lg font-semibold">{authStore.user.username}</p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"
          >
            <Hash class="h-6 w-6 text-primary" />
          </div>
          <div class="grid gap-1">
            <p class="text-sm font-medium leading-none text-muted-foreground">
              User ID (UUID)
            </p>
            <p class="text-sm font-mono">{authStore.user.uuid}</p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"
          >
            <Mail class="h-6 w-6 text-primary" />
          </div>
          <div class="grid gap-1">
            <p class="text-sm font-medium leading-none text-muted-foreground">
              Email
            </p>
            <p class="text-base">{authStore.user.email || "-"}</p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div
            class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10"
          >
            <Shield class="h-6 w-6 text-primary" />
          </div>
          <div class="grid gap-1">
            <p class="text-sm font-medium leading-none text-muted-foreground">
              Roles
            </p>
            <div class="flex flex-wrap gap-2">
              {#each getRoles(authStore.user.roles) as role}
                <Badge variant="secondary" class="capitalize">{role}</Badge>
              {/each}
            </div>
          </div>
        </div>
      </div>
    {:else}
      <div class="text-center p-8 text-muted-foreground">
        Failed to load profile.
      </div>
    {/if}
  </Card.Content>
</Card.Root>
