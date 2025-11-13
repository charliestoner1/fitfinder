import api from './client';
import { ClothingItem, ClothingItemCreate, ClothingItemUpdate } from '@/types/wardrobe';

export const wardrobeService = {
  async getItems(): Promise<ClothingItem[]> {
    const response = await api.get('/wardrobe/items/');
    return response.data;
  },

  async getItem(id: number): Promise<ClothingItem> {
    const response = await api.get(`/wardrobe/items/${id}/`);
    return response.data;
  },

  async uploadItem(data: ClothingItemCreate): Promise<ClothingItem> {
    const formData = new FormData();
    formData.append('image', data.image);
    
    if (data.category) formData.append('category', data.category);
    if (data.colors) formData.append('colors', JSON.stringify(data.colors));
    if (data.season) formData.append('season', data.season);
    if (data.brand) formData.append('brand', data.brand);
    if (data.material) formData.append('material', data.material);
    if (data.price) formData.append('price', data.price.toString());

    const response = await api.post('/wardrobe/items/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateItem(id: number, data: ClothingItemUpdate): Promise<ClothingItem> {
    const response = await api.patch(`/wardrobe/items/${id}/`, data);
    return response.data;
  },

  async deleteItem(id: number): Promise<void> {
    await api.delete(`/wardrobe/items/${id}/`);
  },
};