import { api } from './api';
import * as SecureStore from 'expo-secure-store';

export const authService = {
  login: async (email, password) => {
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

  register: async (data) => {
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
  }
};
