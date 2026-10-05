import { api } from './api';
import * as SecureStore from 'expo-secure-store';

export const authService = {
  login: async (email: any, password: any) => {
    const response = await api.post('/users/login', { email, password });
    if (response.data && response.data.data) {
      await SecureStore.setItemAsync('accessToken', response.data.data.accessToken);
      if (response.data.data.refreshToken) {
        await SecureStore.setItemAsync('refreshToken', response.data.data.refreshToken);
      }
      await SecureStore.setItemAsync('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  register: async (data: any) => {
    const response = await api.post('/users/register', data);
    if (response.data && response.data.data) {
      await SecureStore.setItemAsync('accessToken', response.data.data.accessToken);
      if (response.data.data.refreshToken) {
        await SecureStore.setItemAsync('refreshToken', response.data.data.refreshToken);
      }
      await SecureStore.setItemAsync('user', JSON.stringify(response.data.data.user));
    }
    return response.data;
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('user');
  },

  checkLogin: async () => {
    const token = await SecureStore.getItemAsync('accessToken');
    return !!token;
  },

  getMe: async () => {
    try {
      const response = await api.get('/users/me');
      if (response.data && response.data.data) {
        await SecureStore.setItemAsync('user', JSON.stringify(response.data.data));
      }
      return response.data;
    } catch (e) {
      return { success: false, data: null };
    }
  },

  updateProfile: async (id: string, data: any) => {
    const response = await api.put(`/users/${id}`, data);
    if (response.data && response.data.data) {
       const userStr = await SecureStore.getItemAsync('user');
       if (userStr) {
         const user = JSON.parse(userStr);
         const updatedUser = { ...user, ...response.data.data };
         await SecureStore.setItemAsync('user', JSON.stringify(updatedUser));
       }
    }
    return response.data;
  },

  changePassword: async (oldPassword: string, newPassword: string) => {
    try {
      const response = await api.post('/users/change-password', { oldPassword, newPassword });
      return response.data;
    } catch (e: any) {
      if (e.response && e.response.data) {
        return e.response.data;
      }
      return { success: false, message: 'Lỗi kết nối máy chủ' };
    }
  }
};
