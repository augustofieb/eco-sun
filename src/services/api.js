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
  const token = sessionStorage.getItem('token');
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
  search: (query) => api.get(`/produtos/search?query=${encodeURIComponent(query)}`),
  getByCategory: (categoriaId) => api.get(`/produtos/categoria/${categoriaId}`),
  getById: (id) => api.get(`/produtos/${id}`),
  create: (produto) => api.post('/produtos', produto),
  update: (id, produto) => api.put(`/produtos/${id}`, produto),
  delete: (id) => api.delete(`/produtos/${id}`),
};

// Users API
export const usersAPI = {
  getAll: () => api.get('/usuarios'),
  search: (query) => api.get(`/usuarios/search?query=${encodeURIComponent(query)}`),
  getById: (id) => api.get(`/usuarios/${id}`),
  update: (id, usuario) => api.put(`/usuarios/${id}`, usuario),
  toggleAdmin: (id) => api.put(`/usuarios/${id}/toggle-admin`),
  delete: (id) => api.delete(`/usuarios/${id}`),
};

// Reviews API
export const reviewsAPI = {
  getByProduct: (produtoId) => api.get(`/avaliacoes/produto/${produtoId}`),
  create: (avaliacao) => api.post('/avaliacoes', avaliacao),
  delete: (id) => api.delete(`/avaliacoes/${id}`),
};

// User Preferences API
export const preferencesAPI = {
  get: () => api.get('/usuarios/preferencias'),
  update: (preferencias) => api.put('/usuarios/preferencias', preferencias),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get('/categorias'),
  search: (query) => api.get(`/categorias/search?query=${encodeURIComponent(query)}`),
  create: (categoria) => api.post('/categorias', categoria),
  update: (id, categoria) => api.put(`/categorias/${id}`, categoria),
  delete: (id) => api.delete(`/categorias/${id}`),
};

// Orcamentos API
export const orcamentosAPI = {
  getAll: () => api.get('/orcamentos'),
  getByUser: (usuarioId) => api.get(`/orcamentos/usuario/${usuarioId}`),
  create: (orcamento) => api.post('/orcamentos', orcamento),
  update: (id, orcamento) => api.put(`/orcamentos/${id}`, orcamento),
  delete: (id) => api.delete(`/orcamentos/${id}`),
};

export default api;