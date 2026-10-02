import { api } from './api';

export const wishlistService = {
  getMyWishlist: async () => {
    try {
      const response = await api.get('/wishlists');
      return response.data;
    } catch {
      return { success: false, data: [] };
    }
  },
  toggleWishlist: async (bookId: number) => {
    try {
      const response = await api.post('/wishlists', { book_id: bookId });
      return response.data;
    } catch {
      return { success: false, data: null };
    }
  },
};
