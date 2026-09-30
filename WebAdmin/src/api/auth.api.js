import api from './axios'

export const authApi = {
  login: (email, password) =>
    api.post('/users/login', { email, password }),

  refresh: (refreshToken) =>
    api.post('/users/refresh', { refreshToken }),

  getMe: () =>
    api.get('/users/me'),
}

