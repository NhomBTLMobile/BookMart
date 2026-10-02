import { api } from './api';

export const bookService = {
  getBookDetails: async (id: string) => {
    try {
      const response = await api.get(`/books/${id}/details`);
      return response.data;
    } catch {
      return { success: false, data: null };
    }
  },

  getBookReviews: async (bookId: string, limit = 5) => {
    try {
      const response = await api.get(`/reviews?book_id=${bookId}&limit=${limit}`);
      return response.data;
    } catch {
      return { success: false, data: [] };
    }
  }
};
