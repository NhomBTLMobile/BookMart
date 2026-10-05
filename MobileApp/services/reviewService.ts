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
  }
};
