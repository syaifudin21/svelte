import api from "./api";
import { env } from "$env/dynamic/public";

const BASE_URL = env.PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface FileData {
  id: number;
  user_id: number;
  name: string;
  path: string;
  url?: string;
  size: number;
  mime_type?: string;
  created_at: string;
}

export interface FileListResponse {
  items: FileData[];
  total_items: number;
  total_pages: number;
  current_page: number;
  items_per_page: number;
}

export interface FileUploadResponse {
  id: number;
  user_id: number;
  url: string;
  path: string;
  name: string;
  size: number;
}

export const fileService = {
  async uploadFile(file: globalThis.File, name: string): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);

    const response = await api.post("/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.data;
  },

  async getFiles(search?: string, page: number = 1, limit: number = 10): Promise<FileListResponse> {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const response = await api.get(`/api/files?${params.toString()}`);
    return response.data.data;
  },

  async deleteFile(id: number): Promise<{ id: number }> {
    const response = await api.delete(`/api/files/${id}`);
    return response.data.data;
  },

  getFileUrl(path: string): string {
    if (path.startsWith("http")) {
      return path;
    }
    return `${BASE_URL}/${path}`;
  },
};
