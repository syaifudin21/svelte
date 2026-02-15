<script lang="ts">
    import * as Card from "$lib/components/ui/card";
    import { Input } from "$lib/components/ui/input";
    import { Label } from "$lib/components/ui/label";
    import { Button } from "$lib/components/ui/button";
    import { Tabs, TabsContent, TabsList, TabsTrigger } from "$lib/components/ui/tabs";
    import { onMount } from "svelte";
    import { uiStore } from "$lib/stores/ui.svelte";

    onMount(() => {
        uiStore.setBreadcrumbs([
            { label: uiStore.t("sidebar.dashboard"), href: "/dashboard" },
            { label: uiStore.t("settings.title") }
        ]);
    });
</script>

<Tabs value="account" class="space-y-4">
    <TabsList>
        <TabsTrigger value="account">{uiStore.t("settings.account")}</TabsTrigger>
        <TabsTrigger value="password">{uiStore.t("settings.password")}</TabsTrigger>
    </TabsList>
    <TabsContent value="account">
        <Card.Root>
            <Card.Header>
                <Card.Title>{uiStore.t("settings.account_settings")}</Card.Title>
                <Card.Description>{uiStore.t("settings.account_desc")}</Card.Description>
            </Card.Header>
            <Card.Content class="space-y-4">
                <div class="grid gap-2">
                    <Label for="username">{uiStore.t("settings.username")}</Label>
                    <Input id="username" value="johndoe" />
                </div>
                <div class="grid gap-2">
                    <Label for="email">{uiStore.t("settings.email")}</Label>
                    <Input id="email" value="john@example.com" />
                </div>
            </Card.Content>
            <Card.Footer>
                <Button>{uiStore.t("settings.save_changes")}</Button>
            </Card.Footer>
        </Card.Root>
    </TabsContent>
    <TabsContent value="password">
        <Card.Root>
            <Card.Header>
                <Card.Title>{uiStore.t("settings.password")}</Card.Title>
                <Card.Description>{uiStore.t("settings.update_password")}</Card.Description>
            </Card.Header>
            <Card.Content class="space-y-4">
                <div class="grid gap-2">
                    <Label for="current">{uiStore.t("settings.current_password")}</Label>
                    <Input id="current" type="password" />
                </div>
                <div class="grid gap-2">
                    <Label for="new">{uiStore.t("settings.new_password")}</Label>
                    <Input id="new" type="password" />
                </div>
            </Card.Content>
            <Card.Footer>
                <Button>{uiStore.t("settings.update_password")}</Button>
            </Card.Footer>
        </Card.Root>
    </TabsContent>
</Tabs>
