// src/lib/api/outfits.ts - API service for outfit CRUD operations and image handling


import axios from 'axios';
import type { Outfit } from '@/store/outfit-builder-store';
import { keysToCamelCase, keysToSnakeCase } from '@/lib/utils/case-transformer';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Axios instance with auth headers
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface CreateOutfitRequest {
  name: string;
  occasion?: string;
  season?: string;
  items: Array<{
    clothing_item_id:number;
    layer: string;
    position_x: number;
    position_y: number;
    size_width: number;
    size_height: number;
    rotation: number;
    z_index: number;
  }>;
}

export interface OutfitResponse {
  id: string;
  name: string;
  occasion?: string;
  season?: string;
  preview_image_url?: string;
  items: Array<{
    id: string;
    clothing_item: {
      id: string;
      image_url: string;
      category: string;
      colors: string[];
      season: string;
      brand?: string;
    };
    layer: string;
    position_x: number;
    position_y: number;
    size_width: number;
    size_height: number;
    rotation: number;
    z_index: number;
  }>;
  created_at: string;
  updated_at: string;
}

/**
 * Create a new outfit
 */
export async function createOutfit(outfit: Outfit): Promise<OutfitResponse> {
  const request: CreateOutfitRequest = {
    name: outfit.name,
    occasion: outfit.occasion,
    season: outfit.season,
    items: outfit.items.map((item) => ({
      clothing_item_id: parseInt(item.id),
      layer: item.layer,
      position_x: item.position.x,
      position_y: item.position.y,
      size_width: item.size.width,
      size_height: item.size.height,
      rotation: item.rotation,
      z_index: item.zIndex,
    })),
  };

  const response = await apiClient.post<OutfitResponse>('/outfits/', request);
  // Transform snake_case from Django to camelCase for frontend
  return keysToCamelCase<OutfitResponse>(response.data);
}

/**
 * Get all outfits for the current user
 */
export async function getOutfits(): Promise<OutfitResponse[]> {
  const response = await apiClient.get<OutfitResponse[]>('/outfits/');
  // Transform snake_case from Django to camelCase for frontend
  return keysToCamelCase<OutfitResponse[]>(response.data);
}

/**
 * Get a specific outfit by ID
 */
export async function getOutfit(outfitId: string): Promise<OutfitResponse> {
  const response = await apiClient.get<OutfitResponse>(`/outfits/${outfitId}/`);
  // Transform snake_case from Django to camelCase for frontend
  return keysToCamelCase<OutfitResponse>(response.data);
}

/**
 * Update an existing outfit
 */
export async function updateOutfit(
  outfitId: string,
  outfit: Partial<Outfit>
): Promise<OutfitResponse> {
  const request: Partial<CreateOutfitRequest> = {};

  if (outfit.name) request.name = outfit.name;
  if (outfit.occasion) request.occasion = outfit.occasion;
  if (outfit.season) request.season = outfit.season;
  if (outfit.items) {
    request.items = outfit.items.map((item) => ({
      clothing_item_id: parseInt(item.id),
      layer: item.layer,
      position_x: item.position.x,
      position_y: item.position.y,
      size_width: item.size.width,
      size_height: item.size.height,
      rotation: item.rotation,
      z_index: item.zIndex,
    }));
  }

  const response = await apiClient.patch<OutfitResponse>(
    `/outfits/${outfitId}/`,
    request
  );
  // Transform snake_case from Django to camelCase for frontend
  return keysToCamelCase<OutfitResponse>(response.data);
}

/**
 * Delete an outfit
 */
export async function deleteOutfit(outfitId: string): Promise<void> {
  await apiClient.delete(`/outfits/${outfitId}/`);
}

/**
 * Upload outfit preview image
 */
export async function uploadOutfitPreview(
  outfitId: string,
  imageBlob: Blob
): Promise<{ preview_image_url: string }> {
  const formData = new FormData();
  formData.append('preview_image', imageBlob, 'outfit-preview.png');

  const response = await apiClient.post<{ preview_image_url: string }>(
    `/outfits/${outfitId}/upload-preview/`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

// Generate outfit preview image from canvas
export async function generateOutfitPreview(
  canvasElement: HTMLElement
): Promise<Blob> {
  // Import html2canvas dynamically to avoid SSR issues
  const html2canvas = (await import('html2canvas')).default;

  const canvas = await html2canvas(canvasElement, {
    backgroundColor: '#f9fafb',
    scale: 2,
  });

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      }
    }, 'image/png');
  });
}