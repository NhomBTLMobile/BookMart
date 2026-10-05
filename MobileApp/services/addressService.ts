import { api } from './api';
import * as SecureStore from 'expo-secure-store';

let selectedAddressId: string | null = null;

export const addressService = {
  setSelectedAddressId: (id: string | null) => { selectedAddressId = id; },
  getSelectedAddressId: () => selectedAddressId,
  getMyAddresses: async () => {
    try {
      const userStr = await SecureStore.getItemAsync('user');
      if (!userStr) return [];
      const user = JSON.parse(userStr);
      const res = await api.get(`/user_addresses?user_id=${user.id}`);
      return res.data.data;
    } catch (e) {
      console.error(e);
      return [];
    }
  },
  getAddressById: async (id: string) => {
    const res = await api.get(`/user_addresses/${id}`);
    return res.data.data;
  },
  createAddress: async (data: any) => {
    const userStr = await SecureStore.getItemAsync('user');
    if (userStr) {
      data.user_id = JSON.parse(userStr).id;
    }
    const res = await api.post('/user_addresses', data);
    return res.data;
  },
  updateAddress: async (id: string, data: any) => {
    const res = await api.put(`/user_addresses/${id}`, data);
    return res.data;
  },
  deleteAddress: async (id: string) => {
    try {
      const res = await api.delete(`/user_addresses/${id}`);
      return { success: true, ...res.data };
    } catch (e: any) {
      console.error(e);
      return { success: false, message: e.response?.data?.message || 'Lỗi xoá' };
    }
  }
};
