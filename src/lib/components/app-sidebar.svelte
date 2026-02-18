<script lang="ts">
  import CameraIcon from "@tabler/icons-svelte/icons/camera";
  import ChartBarIcon from "@tabler/icons-svelte/icons/chart-bar";
  import DashboardIcon from "@tabler/icons-svelte/icons/dashboard";
  import DatabaseIcon from "@tabler/icons-svelte/icons/database";
  import FileAiIcon from "@tabler/icons-svelte/icons/file-ai";
  import FileDescriptionIcon from "@tabler/icons-svelte/icons/file-description";
  import FileWordIcon from "@tabler/icons-svelte/icons/file-word";
  import FolderIcon from "@tabler/icons-svelte/icons/folder";
  import HelpIcon from "@tabler/icons-svelte/icons/help";
  import InnerShadowTopIcon from "@tabler/icons-svelte/icons/inner-shadow-top";
  import ListDetailsIcon from "@tabler/icons-svelte/icons/list-details";
  import ReportIcon from "@tabler/icons-svelte/icons/report";
  import SearchIcon from "@tabler/icons-svelte/icons/search";
  import SettingsIcon from "@tabler/icons-svelte/icons/settings";
  import UsersIcon from "@tabler/icons-svelte/icons/users";
  import NavDocuments from "./nav-documents.svelte";
  import NavMain from "./nav-main.svelte";
  import NavSecondary from "./nav-secondary.svelte";
  import NavUser from "./nav-user.svelte";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import type { ComponentProps } from "svelte";
  import { StoreIcon } from "lucide-svelte";

  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: DashboardIcon,
      },
      {
        title: "Driver",
        url: "/driver",
        icon: UsersIcon,
      },
      {
        title: "Admin",
        url: "/admin",
        icon: UsersIcon,
      },
      {
        title: "Wallet",
        url: "#",
        icon: DatabaseIcon,
        items: [
          {
            title: "Request",
            url: "/wallet/request",
          },
        ],
      },
      {
        title: "Merchant",
        url: "#",
        icon: StoreIcon,
        items: [
          {
            title: "Merchant Nearby",
            url: "/merchant/nearby",
          },
          {
            title: "List Merchant",
            url: "/merchant",
          },
        ],
      },
      {
        title: "Tarif",
        url: "#",
        icon: ListDetailsIcon,
        items: [
          {
            title: "Daftar Tarif",
            url: "/tariff",
          },
          {
            title: "Cek Tarif",
            url: "/tariff/check",
          },
        ],
      },
      {
        title: "Analytics",
        url: "#",
        icon: ChartBarIcon,
      },
    ],
    navClouds: [
      {
        title: "Capture",
        icon: CameraIcon,
        isActive: true,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
      },
      {
        title: "Proposal",
        icon: FileDescriptionIcon,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
      },
      {
        title: "Prompts",
        icon: FileAiIcon,
        url: "#",
        items: [
          {
            title: "Active Proposals",
            url: "#",
          },
          {
            title: "Archived",
            url: "#",
          },
        ],
      },
    ],
    navSecondary: [
      {
        title: "Settings",
        url: "/setting",
        icon: SettingsIcon,
      },
      {
        title: "Get Help",
        url: "/help",
        icon: HelpIcon,
      },
      {
        title: "Search",
        url: "#",
        icon: SearchIcon,
      },
    ],
    documents: [
      {
        name: "Data Library",
        url: "/data-library",
        icon: DatabaseIcon,
      },
      {
        name: "Reports",
        url: "#",
        icon: ReportIcon,
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
            <a href="##" {...props}>
              <InnerShadowTopIcon class="!size-5" />
              <span class="text-base font-semibold">Acme Inc.</span>
            </a>
          {/snippet}
        </Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  </Sidebar.Header>
  <Sidebar.Content>
    <NavMain items={data.navMain} />
    <NavDocuments items={data.documents} />
    <NavSecondary items={data.navSecondary} class="mt-auto" />
  </Sidebar.Content>
  <Sidebar.Footer>
    <NavUser user={data.user} />
  </Sidebar.Footer>
</Sidebar.Root>
