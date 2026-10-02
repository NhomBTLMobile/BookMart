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
  },
  
  getAllBooks: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/books?page=${page}&limit=${limit}`);
      return response.data;
    } catch { return { success: false, data: [] }; }
  },

  searchBooks: async (query: string, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/books?search=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
      return response.data;
    } catch { return { success: false, data: [] }; }
  },
  
  getCombos: async (limit = 5) => {
    try {
      const response = await api.get(`/combos?limit=${limit}`);
      return response.data;
    } catch { return { success: false, data: [] }; }
  },

  getVouchers: async () => {
    try {
      const response = await api.get('/vouchers?limit=10'); // Fetch a few to find a shipping voucher
      return response.data;
    } catch { return { success: false, data: [] }; }
  }
};
