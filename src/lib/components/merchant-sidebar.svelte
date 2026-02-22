<script lang="ts">
  import DashboardIcon from "@tabler/icons-svelte/icons/dashboard";
  import BuildingStoreIcon from "@tabler/icons-svelte/icons/building-store";
  import HelpIcon from "@tabler/icons-svelte/icons/help";
  import SettingsIcon from "@tabler/icons-svelte/icons/settings";
  import InnerShadowTopIcon from "@tabler/icons-svelte/icons/inner-shadow-top";
  import NavMerchant from "./nav-merchant.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import type { ComponentProps } from "svelte";
  import { uiStore } from "$lib/stores/ui.svelte";

  const data = {
    user: {
      name: "Merchant",
      email: "merchant@example.com",
      avatar: "",
    },
    navMain: [
      {
        title: uiStore.t("sidebar.dashboard"),
        url: "/merchant/dashboard",
        icon: DashboardIcon,
      },
      {
        title: "Asset",
        url: "/merchant/asset",
        icon: BuildingStoreIcon,
      },
    ],
    navSecondary: [
      {
        title: uiStore.t("sidebar.settings"),
        url: "/merchant/setting",
        icon: SettingsIcon,
      },
      {
        title: uiStore.t("sidebar.help"),
        url: "/merchant/help",
        icon: HelpIcon,
      },
    ],
  };

  let { ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();
</script>

<Sidebar.Root collapsible="offcanvas" {...restProps}>
  <Sidebar.Header>
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton class="data-[slot=sidebar-menu-button]:!p-1.5">
          {#snippet child({ props })}
            <a href="/merchant/dashboard" {...props}>
              <InnerShadowTopIcon class="!size-5" />
              <span class="text-base font-semibold">Merchant</span>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>
  <Sidebar.Content>
    <Sidebar.Group>
      <Sidebar.GroupLabel>Menu Utama</Sidebar.GroupLabel>
      <Sidebar.GroupContent class="flex flex-col gap-2">
        {#each data.navMain as item}
          <Sidebar.MenuItem>
            <a
              href={item.url}
              class="ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-start text-sm transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pe-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:font-medium [&>svg]:size-4 [&>svg]:shrink-0"
            >
              {#if item.icon}
                <item.icon class="w-5 h-5" />
              {/if}
              <span>{item.title}</span>
            </a>
          </Sidebar.MenuItem>
        {/each}
      </Sidebar.GroupContent>
    </Sidebar.Group>

    <Sidebar.Group class="mt-auto">
      <Sidebar.GroupLabel>Lainnya</Sidebar.GroupLabel>
      <Sidebar.GroupContent class="flex flex-col gap-2">
        {#each data.navSecondary as item}
          <Sidebar.MenuItem>
            <a
              href={item.url}
              class="ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-start text-sm transition-[width,height,padding] group-has-data-[sidebar=menu-action]/menu-item:pe-8 group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:font-medium [&>svg]:size-4 [&>svg]:shrink-0"
            >
              {#if item.icon}
                <item.icon class="w-5 h-5" />
              {/if}
              <span>{item.title}</span>
            </a>
          </Sidebar.MenuItem>
        {/each}
      </Sidebar.GroupContent>
    </Sidebar.Group>
  </Sidebar.Content>
  <Sidebar.Footer>
    <NavMerchant user={data.user} />
  </Sidebar.Footer>
</Sidebar.Root>
