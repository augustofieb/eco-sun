import { authAPI, usersAPI } from '../services/api';

let currentUser = null;
let authToken = null;

export const loginUser = async (email, password) => {
  try {
    const response = await authAPI.login(email, password);
    const { token, id, nome, email: userEmail, nivelAcesso } = response.data;
    
    authToken = token;
    currentUser = { id, name: nome, email: userEmail, nivelAcesso };
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(currentUser));
    
    return { success: true, user: currentUser };
  } catch (error) {
    return { success: false, error: 'Credenciais inválidas' };
  }
};

export const registerUser = async (name, email, password) => {
  try {
    const response = await authAPI.register(name, email, password);
    const { token, id, nome, email: userEmail, nivelAcesso } = response.data;
    
    authToken = token;
    currentUser = { id, name: nome, email: userEmail, nivelAcesso };
    sessionStorage.setItem('token', token);
    sessionStorage.setItem('user', JSON.stringify(currentUser));
    
    return { success: true, user: currentUser };
  } catch (error) {
    return { success: false, error: 'Erro ao criar conta' };
  }
};

export const isLoggedIn = () => {
  return authToken !== null || sessionStorage.getItem('token') !== null;
};

export const getCurrentUser = () => {
  if (currentUser) return currentUser;
  
  const token = authToken || sessionStorage.getItem('token');
  if (!token) return null;
  
  // Se temos token mas não temos currentUser, significa que a página foi recarregada
  // Vamos tentar recuperar os dados do sessionStorage
  const userData = sessionStorage.getItem('user');
  if (userData) {
    try {
      currentUser = JSON.parse(userData);
      return currentUser;
    } catch (error) {
      return null;
    }
  }
  
  return null;
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.nivelAcesso === 'ADMIN';
};

export const logoutUser = () => {
  authToken = null;
  currentUser = null;
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
};

export const getToken = () => {
  return authToken || sessionStorage.getItem('token');
};