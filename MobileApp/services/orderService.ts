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
  
  createOrder: async (data: any) => {
    try {
      const response = await api.post('/orders', data);
      return response.data;
    } catch (e: any) {
      return { success: false, message: e.response?.data?.message || 'Có lỗi xảy ra' };
    }
  }
};
