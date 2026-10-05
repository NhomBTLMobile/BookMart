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
  },

  calculateFee: async (data: { to_district_id: number; to_ward_code: string; items: any[] }) => {
    try {
      const response = await api.post('/orders/ghn/calculate-fee', data);
      return response.data; // { success: true, message: ..., data: { total: ... } }
    } catch (e: any) {
      return { success: false, message: e.response?.data?.message || 'Không thể tính phí' };
    }
  }
};
