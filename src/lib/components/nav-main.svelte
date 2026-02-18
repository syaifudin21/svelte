<script lang="ts">
  import CirclePlusFilledIcon from "@tabler/icons-svelte/icons/circle-plus-filled";
  import MailIcon from "@tabler/icons-svelte/icons/mail";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Sidebar from "$lib/components/ui/sidebar/index.js";
  import * as Collapsible from "$lib/components/ui/collapsible/index.js";
  import { ChevronRight } from "lucide-svelte";
  import { page } from "$app/stores";
  import type { Component } from "svelte";

  let {
    items,
  }: {
    items: {
      title: string;
      url: string;
      icon?: any;
      items?: { title: string; url: string }[];
      isActive?: boolean;
    }[];
  } = $props();
</script>

<Sidebar.Group>
  <Sidebar.GroupContent class="flex flex-col gap-2">
    <Sidebar.Menu>
      <Sidebar.MenuItem class="flex items-center gap-2">
        <Sidebar.MenuButton
          class="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
          tooltipContent="Quick create"
        >
          <CirclePlusFilledIcon />
          <span>Quick Create</span>
        </Sidebar.MenuButton>
        <Button
          size="icon"
          class="size-8 group-data-[collapsible=icon]:opacity-0"
          variant="outline"
        >
          <MailIcon />
          <span class="sr-only">Inbox</span>
        </Button>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
    <Sidebar.Menu>
      {#each items as item (item.title)}
        {#if item.items && item.items.length > 0}
          <Collapsible.Root
            open={item.isActive ||
              item.items?.some((sub) => $page.url.pathname === sub.url)}
            class="group/collapsible"
          >
            <Sidebar.MenuItem>
              <Collapsible.Trigger>
                {#snippet child({ props })}
                  <Sidebar.MenuButton
                    {...props}
                    tooltipContent={item.title}
                    isActive={$page.url.pathname === item.url}
                  >
                    {#if item.icon}
                      <item.icon />
                    {/if}
                    <span>{item.title}</span>
                    <ChevronRight
                      class="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90"
                    />
                  </Sidebar.MenuButton>
                {/snippet}
              </Collapsible.Trigger>
              <Collapsible.Content>
                <Sidebar.MenuSub>
                  {#each item.items as subItem}
                    <Sidebar.MenuSubItem>
                      <Sidebar.MenuSubButton
                        isActive={$page.url.pathname === subItem.url}
                      >
                        {#snippet child({ props })}
                          <a href={subItem.url} {...props}>
                            <span>{subItem.title}</span>
                          </a>
                        {/snippet}
                      </Sidebar.MenuSubButton>
                    </Sidebar.MenuSubItem>
                  {/each}
                </Sidebar.MenuSub>
              </Collapsible.Content>
            </Sidebar.MenuItem>
          </Collapsible.Root>
        {:else}
          <Sidebar.MenuItem>
            <Sidebar.MenuButton
              tooltipContent={item.title}
              isActive={$page.url.pathname === item.url}
            >
              {#snippet child({ props })}
                <a href={item.url} {...props}>
                  {#if item.icon}
                    <item.icon />
                  {/if}
                  <span>{item.title}</span>
                </a>
              {/snippet}
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        {/if}
      {/each}
    </Sidebar.Menu>
  </Sidebar.GroupContent>
</Sidebar.Group>
