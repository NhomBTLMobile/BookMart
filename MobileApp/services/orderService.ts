import { api } from './api';

export const orderService = {
  getMyOrders: async () => {
    try {
      const response = await api.get('/orders/me');
      return response.data;
    } catch {
      return { success: false, data: [] };
    }
  },
};
