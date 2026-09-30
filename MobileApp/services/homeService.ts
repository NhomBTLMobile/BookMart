import { api } from './api';

export const homeService = {
  getFeaturedBooks: async (limit = 10) => {
    try {
      const response = await api.get(`/books/home/featured?limit=${limit}`);
      return response.data;
    } catch { return { success: false, data: [] }; }
  },
  
  getNewBooks: async (limit = 10) => {
    try {
      const response = await api.get(`/books/home/new?limit=${limit}`);
      return response.data;
    } catch { return { success: false, data: [] }; }
  },
  
  getBestsellers: async (limit = 10) => {
    try {
      const response = await api.get(`/books/home/bestsellers?limit=${limit}`);
      return response.data;
    } catch { return { success: false, data: [] }; }
  },
  
  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch { return { success: false, data: [] }; }
  }
};
