import { writable } from "svelte/store";

export const forbiddenDialog = writable({
  open: false,
  title: "Akses Ditolak",
  description: "Anda tidak memiliki izin untuk mengakses resource ini. Silakan hubungi administrator jika Anda memerlukan akses.",
});

export function showForbiddenDialog(title?: string, description?: string) {
  forbiddenDialog.set({
    open: true,
    title: title || "Akses Ditolak",
    description: description || "Anda tidak memiliki izin untuk mengakses resource ini. Silakan hubungi administrator jika Anda memerlukan akses.",
  });
}

export function closeForbiddenDialog() {
  forbiddenDialog.update((state) => ({ ...state, open: false }));
}
