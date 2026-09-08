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
  getAll:  (params) => api.get('/Users',      { params: buildParams(params) }),
  getById: (id)     => api.get(`/Users/${id}`),
  create:  (data)   => api.post('/Users',     data),
  update:  (id, data) => api.put(`/Users/${id}`, data),
  remove:  (id)     => api.delete(`/Users/${id}`),
}

// ── Books ──────────────────────────────────────────────────────
export const booksApi = {
  getAll:  (params) => api.get('/Books',      { params: buildParams(params) }),
  getById: (id)     => api.get(`/Books/${id}`),
  create:  (data)   => api.post('/Books',     data),
  update:  (id, data) => api.put(`/Books/${id}`, data),
  remove:  (id)     => api.delete(`/Books/${id}`),
}

// ── Authors ────────────────────────────────────────────────────
export const authorsApi = {
  getAll:  (params) => api.get('/Authors',      { params: buildParams(params) }),
  getById: (id)     => api.get(`/Authors/${id}`),
  create:  (data)   => api.post('/Authors',     data),
  update:  (id, data) => api.put(`/Authors/${id}`, data),
  remove:  (id)     => api.delete(`/Authors/${id}`),
}

// ── Categories ─────────────────────────────────────────────────
export const categoriesApi = {
  getAll:  (params) => api.get('/Categories',      { params: buildParams(params) }),
  getById: (id)     => api.get(`/Categories/${id}`),
  create:  (data)   => api.post('/Categories',     data),
  update:  (id, data) => api.put(`/Categories/${id}`, data),
  remove:  (id)     => api.delete(`/Categories/${id}`),
}

// ── Orders ─────────────────────────────────────────────────────
export const ordersApi = {
  getAll:  (params) => api.get('/Orders',      { params: buildParams(params) }),
  getById: (id)     => api.get(`/Orders/${id}`),
  create:  (data)   => api.post('/Orders',     data),
  update:  (id, data) => api.put(`/Orders/${id}`, data),
  remove:  (id)     => api.delete(`/Orders/${id}`),
}

// ── Vouchers ───────────────────────────────────────────────────
export const vouchersApi = {
  getAll:  (params) => api.get('/Vouchers',      { params: buildParams(params) }),
  getById: (id)     => api.get(`/Vouchers/${id}`),
  create:  (data)   => api.post('/Vouchers',     data),
  update:  (id, data) => api.put(`/Vouchers/${id}`, data),
  remove:  (id)     => api.delete(`/Vouchers/${id}`),
}

// ── Reviews ────────────────────────────────────────────────────
export const reviewsApi = {
  getAll:  (params) => api.get('/Reviews',      { params: buildParams(params) }),
  getById: (id)     => api.get(`/Reviews/${id}`),
  remove:  (id)     => api.delete(`/Reviews/${id}`),
}
