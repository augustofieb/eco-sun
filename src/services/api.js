import axios from 'axios'

const API_BASE_URL = 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth API
export const authAPI = {
  login: (email, senha) => api.post('/auth/login', { email, senha }),
  register: (nome, email, senha) => api.post('/auth/register', { nome, email, senha }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  changePassword: (senhaAtual, novaSenha) => api.put('/auth/change-password', { senhaAtual, novaSenha })
}

// Products API
export const productsAPI = {
  getAll: (categoria) => api.get('/products', { params: { categoria } }),
  getById: (id) => api.get(`/products/${id}`),
  create: (product) => api.post('/products', product),
  update: (id, product) => api.put(`/products/${id}`, product),
  delete: (id) => api.delete(`/products/${id}`)
}

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data)
}

// Orcamentos API
export const orcamentosAPI = {
  create: (orcamento) => api.post('/orcamentos', orcamento),
  getMeus: () => api.get('/orcamentos/meus')
}

// Users API
export const usersAPI = {
  getAll: () => api.get('/users'),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`)
}

export default api