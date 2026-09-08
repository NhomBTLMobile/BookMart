import api from './axios'

export const authApi = {
  login: (email, password) =>
    api.post('/Users/login', { email, password }),

  refresh: (refreshToken) =>
    api.post('/Users/refresh', { refreshToken }),

  getMe: () =>
    api.get('/Users/me'),
}
