import api from './axios'

const buildParams = (params = {}) => {
  const p = {}
  if (params.page)   p.page   = params.page
  if (params.limit)  p.limit  = params.limit
  if (params.search) p.search = params.search
  if (params.sort)   p.sort   = params.sort
  if (params.order)  p.order  = params.order
  return p
}

// ── Users ──────────────────────────────────────────────────────
export const usersApi = {
  getAll:  (params) => api.get('/users',      { params: buildParams(params) }),
  getById: (id)     => api.get(`/users/${id}`),
  create:  (data)   => api.post('/users',     data),
  update:  (id, data) => api.put(`/users/${id}`, data),
  remove:  (id)     => api.delete(`/users/${id}`),
}

// ── Books ──────────────────────────────────────────────────────
export const booksApi = {
  getAll:  (params) => api.get('/books',      { params: buildParams(params) }),
  getById: (id)     => api.get(`/books/${id}`),
  create:  (data)   => api.post('/books',     data),
  update:  (id, data) => api.put(`/books/${id}`, data),
  remove:  (id)     => api.delete(`/books/${id}`),
}

// ── Authors ────────────────────────────────────────────────────
export const authorsApi = {
  getAll:  (params) => api.get('/authors',      { params: buildParams(params) }),
  getById: (id)     => api.get(`/authors/${id}`),
  create:  (data)   => api.post('/authors',     data),
  update:  (id, data) => api.put(`/authors/${id}`, data),
  remove:  (id)     => api.delete(`/authors/${id}`),
}

// ── Categories ─────────────────────────────────────────────────
export const categoriesApi = {
  getAll:  (params) => api.get('/categories',      { params: buildParams(params) }),
  getById: (id)     => api.get(`/categories/${id}`),
  create:  (data)   => api.post('/categories',     data),
  update:  (id, data) => api.put(`/categories/${id}`, data),
  remove:  (id)     => api.delete(`/categories/${id}`),
}

// ── Orders ─────────────────────────────────────────────────────
export const ordersApi = {
  getAll:  (params) => api.get('/orders',      { params: buildParams(params) }),
  getById: (id)     => api.get(`/orders/${id}`),
  create:  (data)   => api.post('/orders',     data),
  update:  (id, data) => api.put(`/orders/${id}`, data),
  remove:  (id)     => api.delete(`/orders/${id}`),
  createGHN: (id, data) => api.post(`/orders/${id}/ghn-create`, data),
}

// ── Vouchers ───────────────────────────────────────────────────
export const vouchersApi = {
  getAll:  (params) => api.get('/vouchers',      { params: buildParams(params) }),
  getById: (id)     => api.get(`/vouchers/${id}`),
  create:  (data)   => api.post('/vouchers',     data),
  update:  (id, data) => api.put(`/vouchers/${id}`, data),
  remove:  (id)     => api.delete(`/vouchers/${id}`),
}

// ── Reviews ────────────────────────────────────────────────────
export const reviewsApi = {
  getAll:  (params) => api.get('/reviews',      { params: buildParams(params) }),
  getById: (id)     => api.get(`/reviews/${id}`),
  remove:  (id)     => api.delete(`/reviews/${id}`),
}

// ── Dashboard ──────────────────────────────────────────────────
export const dashboardApi = {
  getStats:       () => api.get('/dashboard/stats'),
  getRevenueChart:() => api.get('/dashboard/revenue-chart'),
  getTopBooks:    () => api.get('/dashboard/top-books'),
  getRecentOrders:() => api.get('/dashboard/recent-orders'),
}

// ── Publishers ─────────────────────────────────────────────────
export const publishersApi = {
  getAll:  (params) => api.get('/publishers',      { params: buildParams(params) }),
  getById: (id)     => api.get(`/publishers/${id}`),
  create:  (data)   => api.post('/publishers',     data),
  update:  (id, data) => api.put(`/publishers/${id}`, data),
  remove:  (id)     => api.delete(`/publishers/${id}`),
}

