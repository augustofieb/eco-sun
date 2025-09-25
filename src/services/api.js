import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (email, senha) => api.post('/auth/login', { email, senha }),
  register: (nome, email, senha) => api.post('/auth/register', { nome, email, senha }),
  forgotPassword: (email) => api.post(`/auth/forgot-password?email=${email}`),
};

// Products API
export const productsAPI = {
  getAll: () => api.get('/produtos'),
  getByCategory: (categoriaId) => api.get(`/produtos/categoria/${categoriaId}`),
  getById: (id) => api.get(`/produtos/${id}`),
  create: (produto) => api.post('/produtos', produto),
  update: (id, produto) => api.put(`/produtos/${id}`, produto),
  delete: (id) => api.delete(`/produtos/${id}`),
};

export default api;