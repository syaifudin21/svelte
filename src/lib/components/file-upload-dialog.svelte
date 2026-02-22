<script lang="ts">
  import { onMount } from "svelte";
  import { toast } from "svelte-sonner";
  import { fileService, type FileData } from "$lib/services/file.service";
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import { Label } from "$lib/components/ui/label";
  import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
  } from "$lib/components/ui/dialog";
  import { Tabs, TabsContent, TabsList, TabsTrigger } from "$lib/components/ui/tabs";
  import { Card, CardContent } from "$lib/components/ui/card";
  import UploadIcon from "@tabler/icons-svelte/icons/upload";
  import FileIcon from "@tabler/icons-svelte/icons/file";
  import DownloadIcon from "@tabler/icons-svelte/icons/download";
  import SearchIcon from "@tabler/icons-svelte/icons/search";
  import XIcon from "@tabler/icons-svelte/icons/x";

  let {
    open = $bindable(false),
    title = "Upload File",
    description = "Pilih file untuk diupload atau pilih dari file yang sudah ada",
    acceptedTypes = "image/*",
    defaultFileName = "",
    uploadTab = $bindable(true),
    onFileSelect = (file: FileData) => {},
  } = $props();

  let selectedFile: globalThis.File | null = $state(null);
  let fileName = $state("");
  let uploading = $state(false);
  let uploadProgress = $state(0);
  let existingFiles: FileData[] = $state([]);
  let loadingFiles = $state(false);
  let searchQuery = $state("");
  let searchTimeout: ReturnType<typeof setTimeout>;
  let fileInputRef: HTMLInputElement | null = $state(null);

  // Set default file name when dialog opens
  $effect(() => {
    if (open && defaultFileName) {
      fileName = defaultFileName;
      // Auto-trigger file input when dialog opens with default file name
      setTimeout(() => {
        if (fileInputRef && !selectedFile) {
          fileInputRef.click();
        }
      }, 100);
    }
  });

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }

  function formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  async function loadFiles() {
    loadingFiles = true;
    try {
      const response = await fileService.getFiles(searchQuery, 1, 50);
      existingFiles = response.items;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load files");
    } finally {
      loadingFiles = false;
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
      // Auto-upload when file is selected
      handleUpload();
    }
  }

  function clearFileSelection() {
    selectedFile = null;
    fileName = "";
    const fileInput = document.getElementById("upload-file-input") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
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

    uploading = true;
    uploadProgress = 0;

    // Simulate progress
    const progressInterval = setInterval(() => {
      uploadProgress = Math.min(uploadProgress + 10, 90);
    }, 200);

    try {
      const uploadedFile = await fileService.uploadFile(selectedFile, fileName);
      clearInterval(progressInterval);
      uploadProgress = 100;
      toast.success("File uploaded successfully");

      // Reload files and reset
      await loadFiles();
      
      // Return uploaded file info and close dialog
      onFileSelect({
        id: uploadedFile.id,
        user_id: uploadedFile.user_id,
        name: uploadedFile.name,
        path: uploadedFile.path,
        url: uploadedFile.url,
        size: uploadedFile.size,
        created_at: new Date().toISOString(),
      });
      
      open = false;
      selectedFile = null;
      fileName = "";
    } catch (error: any) {
      clearInterval(progressInterval);
      uploadProgress = 0;
      toast.error(error.response?.data?.message || "Failed to upload file");
    } finally {
      uploading = false;
      setTimeout(() => {
        uploadProgress = 0;
      }, 500);
    }
  }

  function handleSelectExisting(file: FileData) {
    // Auto-confirm when selecting existing file
    onFileSelect(file);
    open = false;
    resetState();
  }

  function resetState() {
    selectedFile = null;
    fileName = "";
    uploadProgress = 0;
    searchQuery = "";
    if (fileInputRef) {
      fileInputRef.value = "";
    }
  }

  $effect(() => {
    if (open && uploadTab) {
      loadFiles();
    }
  });

  onMount(() => {
    if (open) {
      loadFiles();
    }
  });
</script>

<Dialog bind:open={open}>
  <DialogContent class="max-w-2xl">
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
      <DialogDescription>{description}</DialogDescription>
    </DialogHeader>

    <Tabs value={uploadTab ? 'upload' : 'existing'} on:valueChange={(e) => uploadTab = e.detail === 'upload'}>
      <TabsList class="grid w-full grid-cols-2">
        <TabsTrigger value="upload">
          <UploadIcon class="h-4 w-4 mr-2" />
          Upload New
        </TabsTrigger>
        <TabsTrigger value="existing">
          <FileIcon class="h-4 w-4 mr-2" />
          Existing Files
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upload" class="space-y-4">
        <div class="grid gap-4">
          <div class="grid gap-2">
            <Label for="upload-file-input">File</Label>
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
                    disabled={uploading}
                  >
                    <XIcon class="h-4 w-4" />
                  </button>
                </div>
              {:else}
                <Input
                  id="upload-file-input"
                  type="file"
                  accept={acceptedTypes}
                  onchange={handleFileSelect}
                  class="flex-1"
                  disabled={uploading}
                  bind:this={fileInputRef}
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
              disabled={uploading}
            />
          </div>

          {#if uploadProgress > 0}
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">
                  {uploading ? 'Uploading...' : uploadProgress === 100 ? 'Complete' : ''}
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div class="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  class="h-full bg-primary transition-all duration-300"
                  style="width: {uploadProgress}%"
                ></div>
              </div>
            </div>
          {/if}
        </div>

        {#if !uploading && uploadProgress === 0}
          <div class="flex justify-end gap-2">
            <Button variant="outline" onclick={() => open = false}>
              Cancel
            </Button>
          </div>
        {/if}
      </TabsContent>

      <TabsContent value="existing" class="space-y-4">
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

        {#if loadingFiles}
          <div class="flex items-center justify-center py-12">
            <div class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        {:else if existingFiles.length === 0}
          <div class="flex flex-col items-center justify-center py-12 text-center">
            <FileIcon class="h-16 w-16 text-muted-foreground" />
            <h3 class="mt-4 text-lg font-semibold">No files found</h3>
            <p class="text-sm text-muted-foreground">
              {searchQuery ? "Try a different search term" : "Upload a file to get started"}
            </p>
          </div>
        {:else}
          <div class="grid gap-3 max-h-96 overflow-y-auto">
            {#each existingFiles as file (file.id)}
              <Card
                class="cursor-pointer transition-colors hover:bg-muted"
                onclick={() => handleSelectExisting(file)}
              >
                <CardContent class="p-4">
                  <div class="flex items-center gap-4">
                    <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 relative">
                      {#if file.mime_type?.startsWith('image/')}
                        <img
                          src={fileService.getFileUrl(file.path)}
                          alt={file.name}
                          class="h-full w-full object-cover rounded-lg"
                          onerror={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      {/if}
                      <FileIcon class="h-6 w-6 text-primary" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <h4 class="font-semibold truncate">{file.name}</h4>
                      <p class="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • {formatDate(file.created_at)}
                      </p>
                    </div>
                    <a
                      href={fileService.getFileUrl(file.path)}
                      target="_blank"
                      onclick={(e) => e.stopPropagation()}
                      class="text-primary hover:underline text-sm"
                    >
                      <DownloadIcon class="h-4 w-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            {/each}
          </div>
        {/if}

        <div class="flex justify-end gap-2">
          <Button variant="outline" onclick={() => open = false}>
            Cancel
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  </DialogContent>
</Dialog>
