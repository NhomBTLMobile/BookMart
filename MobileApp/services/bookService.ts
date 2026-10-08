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
  },

  createReview: async (data: any) => {
    try {
      const response = await api.post(`/reviews`, data);
      return response.data;
    } catch (e: any) {
      return { success: false, message: e.response?.data?.message || 'Có lỗi xảy ra' };
    }
  },

  getSimilarBooks: async (bookId: string, limit = 10) => {
    try {
      const response = await api.get(`/recommendations/books/${bookId}/similar?limit=${limit}`);
      return response.data;
    } catch {
      return { success: false, data: [] };
    }
  }
};
