<script lang="ts">
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { fileService, type FileData } from "$lib/services/file.service";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "$lib/components/ui/dialog";
  import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
  } from "$lib/components/ui/alert-dialog";
  import { Label } from "$lib/components/ui/label";
  import UploadIcon from "@tabler/icons-svelte/icons/upload";
  import TrashIcon from "@tabler/icons-svelte/icons/trash";
  import SearchIcon from "@tabler/icons-svelte/icons/search";
  import FileIcon from "@tabler/icons-svelte/icons/file";
  import DownloadIcon from "@tabler/icons-svelte/icons/download";
  import XIcon from "@tabler/icons-svelte/icons/x";

  let files: FileData[] = $state([]);
  let loading = $state(false);
  let uploading = $state(false);
  let searchQuery = $state("");
  let searchTimeout: ReturnType<typeof setTimeout>;
  let uploadDialogOpen = $state(false);
  let deleteDialogOpen = $state(false);
  let fileToDelete: FileData | null = $state(null);
  let selectedFile: globalThis.File | null = $state(null);
  let fileName = $state("");
  let uploadProgress = $state(false);

  function formatFileSize(bytes: globalThis.File | number): string {
    if (typeof bytes === 'number') {
      if (bytes === 0) return "0 Bytes";
      const k = 1024;
      const sizes = ["Bytes", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
    }
    return bytes.name;
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function loadFiles() {
    loading = true;
    try {
      const response = await fileService.getFiles(searchQuery);
      files = response.items;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load files");
    } finally {
      loading = false;
    }
  }

  function handleSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      loadFiles();
    }, 500);
  }

  function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      selectedFile = target.files[0];
      if (!fileName) {
        fileName = selectedFile.name;
      }
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      toast.error("Please select a file");
      return;
    }

    if (!fileName.trim()) {
      toast.error("Please enter a file name");
      return;
    }

    uploadProgress = true;
    uploading = true;
    try {
      await fileService.uploadFile(selectedFile, fileName);
      toast.success("File uploaded successfully");
      uploadDialogOpen = false;
      selectedFile = null;
      fileName = "";
      loadFiles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload file");
    } finally {
      uploading = false;
      uploadProgress = false;
    }
  }

  function confirmDelete(file: FileData) {
    fileToDelete = file;
    deleteDialogOpen = true;
  }

  async function handleDelete() {
    if (!fileToDelete) return;

    try {
      await fileService.deleteFile(fileToDelete.id);
      toast.success("File deleted successfully");
      deleteDialogOpen = false;
      fileToDelete = null;
      loadFiles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete file");
    }
  }

  function clearFileSelection() {
    selectedFile = null;
    fileName = "";
    const fileInput = document.getElementById("file-input") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  }

  onMount(() => {
    loadFiles();
  });
</script>

<div class="flex flex-1 flex-col">
  <div class="@container/main flex flex-1 flex-col gap-2">
    <div class="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div class="flex items-center justify-between px-4 lg:px-6">
        <h1 class="text-2xl font-bold">Files</h1>
        <Button onclick={() => uploadDialogOpen = true}>
          <UploadIcon class="mr-2 h-4 w-4" />
          Upload File
        </Button>
      </div>

      <div class="px-4 lg:px-6">
        <div class="relative">
          <SearchIcon class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search files..."
            bind:value={searchQuery}
            oninput={handleSearch}
            class="pl-10"
          />
        </div>
      </div>

      <div class="px-4 lg:px-6">
        {#if loading}
          <div class="flex items-center justify-center py-12">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        {:else if files.length === 0}
          <div class="flex flex-col items-center justify-center py-12 text-center">
            <FileIcon class="h-16 w-16 text-muted-foreground" />
            <h3 class="mt-4 text-lg font-semibold">No files found</h3>
            <p class="text-sm text-muted-foreground">
              {searchQuery ? "Try a different search term" : "Upload your first file to get started"}
            </p>
          </div>
        {:else}
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {#each files as file (file.id)}
              <div class="group relative flex flex-col overflow-hidden rounded-lg border bg-card">
                <div class="aspect-video w-full overflow-hidden bg-muted flex items-center justify-center">
                  {#if file.mime_type?.startsWith('image/')}
                    <img
                      src={fileService.getFileUrl(file.path)}
                      alt={file.name}
                      class="h-full w-full object-cover"
                      onerror={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  {/if}
                  <FileIcon class="h-12 w-12 text-muted-foreground {file.mime_type?.startsWith('image/') ? 'absolute' : ''}" />
                </div>
                <div class="flex flex-1 flex-col p-4">
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <FileIcon class="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 class="font-semibold">{file.name}</h3>
                        <p class="text-xs text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <p class="mt-3 text-xs text-muted-foreground">
                    {formatDate(file.created_at)}
                  </p>
                </div>
                <div class="flex items-center gap-2 border-t p-4 pt-3">
                  <a href={fileService.getFileUrl(file.path)} target="_blank" class="flex-1">
                    <Button variant="outline" size="sm" class="w-full">
                      <DownloadIcon class="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    class="text-destructive hover:text-destructive"
                    onclick={() => confirmDelete(file)}
                  >
                    <TrashIcon class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</div>

<!-- Upload Dialog -->
<Dialog bind:open={uploadDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Upload File</DialogTitle>
      <DialogDescription>
        Select a file to upload to the server.
      </DialogDescription>
    </DialogHeader>
    <div class="grid gap-4 py-4">
      <div class="grid gap-2">
        <Label for="file-input">File</Label>
        <div class="flex items-center gap-2">
          {#if selectedFile}
            <div class="flex flex-1 items-center gap-2 rounded-md border bg-muted px-3 py-2 text-sm">
              <FileIcon class="h-4 w-4 text-muted-foreground" />
              <span class="flex-1 truncate">{selectedFile.name}</span>
              <span class="text-xs text-muted-foreground">
                {formatFileSize(selectedFile.size)}
              </span>
              <button
                onclick={clearFileSelection}
                class="text-muted-foreground hover:text-foreground"
              >
                <XIcon class="h-4 w-4" />
              </button>
            </div>
          {:else}
            <Input
              id="file-input"
              type="file"
              onchange={handleFileSelect}
              class="flex-1"
            />
          {/if}
        </div>
      </div>
      <div class="grid gap-2">
        <Label for="file-name">File Name</Label>
        <Input
          id="file-name"
          type="text"
          placeholder="Enter file name"
          bind:value={fileName}
        />
      </div>
    </div>
    <DialogFooter>
      <Button variant="outline" onclick={() => uploadDialogOpen = false}>
        Cancel
      </Button>
      <Button onclick={handleUpload} disabled={uploading || !selectedFile}>
        {#if uploading}
          <div class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
          Uploading...
        {:else}
          <UploadIcon class="mr-2 h-4 w-4" />
          Upload
        {/if}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

<!-- Delete Confirmation Dialog -->
<AlertDialog bind:open={deleteDialogOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete File</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to delete "{fileToDelete?.name}"? This action cannot be
        undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction
        onclick={handleDelete}
        class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
