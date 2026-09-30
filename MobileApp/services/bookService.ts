import { api } from './api';

export const bookService = {
  getBookDetails: async (id: string) => {
    try {
      const response = await api.get(`/books/${id}/details`);
      return response.data;
    } catch {
      return { success: false, data: null };
    }
  }
};
