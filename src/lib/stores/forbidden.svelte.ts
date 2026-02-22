import { writable } from "svelte/store";
import { uiStore } from "./ui.svelte";

export const forbiddenDialog = writable({
  open: false,
  title: uiStore.t("forbidden.title"),
  description: uiStore.t("forbidden.description"),
});

export function showForbiddenDialog(title?: string, description?: string) {
  forbiddenDialog.set({
    open: true,
    title: title || uiStore.t("forbidden.title"),
    description: description || uiStore.t("forbidden.description"),
  });
}

export function closeForbiddenDialog() {
  forbiddenDialog.update((state) => ({ ...state, open: false }));
}
