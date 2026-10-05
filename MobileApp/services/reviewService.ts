import { api } from './api';
import * as SecureStore from 'expo-secure-store';

export const reviewService = {
  getMyReviews: async () => {
    try {
      const userStr = await SecureStore.getItemAsync('user');
      if (!userStr) throw new Error('User not found');
      
      const user = JSON.parse(userStr);
      const userId = user.id;
      
      if (!userId) throw new Error('User ID not found');

      const response = await api.get(`/reviews?user_id=${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching my reviews:', error);
      throw error;
    }
  },

  updateReview: async (id: string, data: any) => {
    try {
      const response = await api.put(`/reviews/${id}`, data);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Có lỗi xảy ra' };
    }
  },

  deleteReview: async (id: string) => {
    try {
      const response = await api.delete(`/reviews/${id}`);
      return response.data;
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || 'Có lỗi xảy ra' };
    }
  }
};
