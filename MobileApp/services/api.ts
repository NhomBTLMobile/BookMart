import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

// Replace with your backend URL (e.g. your local IP like 192.168.1.xxx) or 10.0.2.2 for Android emulator
export const API_URL = 'http://192.168.1.4:3000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
