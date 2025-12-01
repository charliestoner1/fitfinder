// frontend/src/lib/api/wardrobe.ts
import api from './client';
import { authService } from './auth'
import { ClothingItem, ClothingItemCreate, ClothingItemUpdate, AutoTagSuggestion } from '@/types/wardrobe';
import { keysToCamelCase } from '@/lib/utils/case-transformer';

export const wardrobeService = {
  async getItems(): Promise<ClothingItem[]> {
    try {
      console.log('📦 Fetching wardrobe items...');
      const response = await api.get('/wardrobe/items/');
      console.log('✅ Wardrobe items received:', response.data);
      
      // Transform snake_case to camelCase
      const items = keysToCamelCase<ClothingItem[]>(response.data);
      return items;
    } catch (error: any) {
      console.error('❌ Error fetching wardrobe items:', error.response?.data || error.message);
      throw error;
    }
  },

  async getItem(id: number): Promise<ClothingItem> {
    try {
      console.log(`📦 Fetching wardrobe item ${id}...`);
      const response = await api.get(`/wardrobe/items/${id}/`);
      console.log('✅ Wardrobe item received:', response.data);
      
      return keysToCamelCase<ClothingItem>(response.data);
    } catch (error: any) {
      console.error(`❌ Error fetching wardrobe item ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },
  async getAutoTagSuggestion(image: File): Promise<AutoTagSuggestion> {
    try {
      console.log('🧠 Requesting auto-tag suggestion for image:', image.name);

      const formData = new FormData();
      formData.append('item_image', image);

      const response = await api.post('/wardrobe/autotag-preview/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data;

      const suggestion: AutoTagSuggestion = {
        tags: data.tags ?? {},
        caption: data.caption ?? undefined,
        suggestedName: data.suggested_name,
        suggestedCategory: data.suggested_category,
      };

      console.log('✅ Auto-tag suggestion:', suggestion);
      return suggestion;
    } catch (error: any) {
      console.error(
        '❌ Error getting auto-tag suggestion:',
        error.response?.data || error.message
      );
      throw error;
    }
  },

  async uploadItem(data: ClothingItemCreate): Promise<ClothingItem> {
    try {
      console.log('📤 Uploading wardrobe item...', {
        fileName: data.image.name,
        fileSize: `${(data.image.size / 1024).toFixed(2)} KB`,
        fileType: data.image.type,
        name: data.name,
        category: data.category,
        season: data.season,
        brand: data.brand,
      });

      const formData = new FormData();
      
      // REQUIRED FIELDS
      formData.append('item_image', data.image); // Django expects 'item_image', not 'image'
      formData.append('name', data.name || 'Untitled Item'); // Required by Django model  
      
      // OPTIONAL FIELDS
      if (data.category) formData.append('category', data.category);
      if (data.season) formData.append('season', data.season);
      if (data.brand) formData.append('brand', data.brand);
      if (data.material) formData.append('material', data.material);
      if (data.price !== undefined && data.price !== null) {
        formData.append('price', data.price.toString());
      }

      // Log FormData contents (for debugging)
      console.log('📋 FormData contents:');
      formData.forEach((value, key) => {
        if (value instanceof File) {
          console.log(`  ${key}: [File] ${value.name}`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      });

      const response = await api.post('/wardrobe/items/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Upload successful:', response.data);
      return keysToCamelCase<ClothingItem>(response.data);
    } catch (error: any) {
      console.error('❌ Upload error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      
      // Provide more specific error messages
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 400) {
        // Get the specific validation error from Django
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          // Extract first error message
          const firstError = Object.values(errorData)[0];
          if (Array.isArray(firstError)) {
            throw new Error(firstError[0] || 'Invalid data. Please check your inputs.');
          }
        }
        throw new Error('Invalid data. Please check all required fields.');
      } else if (error.response?.status === 413) {
        throw new Error('File too large. Please upload an image smaller than 5MB.');
      } else if (error.response?.status === 415) {
        throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to upload item. Please try again.');
      }
    }
  },

  async updateItem(id: number, data: ClothingItemUpdate): Promise<ClothingItem> {
    try {
      console.log(`📝 Updating wardrobe item ${id}...`, data);
      const response = await api.patch(`/wardrobe/items/${id}/`, data);
      console.log('✅ Update successful:', response.data);
      
      return keysToCamelCase<ClothingItem>(response.data);
    } catch (error: any) {
      console.error(`❌ Error updating wardrobe item ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },

  async deleteItem(id: number): Promise<void> {
    try {
      console.log(`🗑️ Deleting wardrobe item ${id}...`);
      await api.delete(`/wardrobe/items/${id}/`);
      console.log('✅ Delete successful');
    } catch (error: any) {
      console.error(`❌ Error deleting wardrobe item ${id}:`, error.response?.data || error.message);
      throw error;
    }
  },
};