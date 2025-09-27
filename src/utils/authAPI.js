import { authAPI, usersAPI } from '../services/api';

let currentUser = null;
let authToken = null;

export const loginUser = async (email, password) => {
  try {
    const response = await authAPI.login(email, password);
    const { token, nome, email: userEmail, nivelAcesso } = response.data;
    
    authToken = token;
    currentUser = { name: nome, email: userEmail, nivelAcesso };
    sessionStorage.setItem('token', token);
    
    return { success: true, user: currentUser };
  } catch (error) {
    return { success: false, error: 'Credenciais inválidas' };
  }
};

export const registerUser = async (name, email, password) => {
  try {
    const response = await authAPI.register(name, email, password);
    const { token, nome, email: userEmail, nivelAcesso } = response.data;
    
    authToken = token;
    currentUser = { name: nome, email: userEmail, nivelAcesso };
    sessionStorage.setItem('token', token);
    
    return { success: true, user: currentUser };
  } catch (error) {
    return { success: false, error: 'Erro ao criar conta' };
  }
};

export const isLoggedIn = () => {
  return authToken !== null || sessionStorage.getItem('token') !== null;
};

export const getCurrentUser = async () => {
  if (currentUser) return currentUser;
  
  const token = authToken || sessionStorage.getItem('token');
  if (!token) return null;
  
  try {
    const response = await usersAPI.getById('me');
    currentUser = response.data;
    return currentUser;
  } catch (error) {
    return null;
  }
};

export const isAdmin = async () => {
  const user = await getCurrentUser();
  return user && user.nivelAcesso === 'ADMIN';
};

export const logoutUser = () => {
  authToken = null;
  currentUser = null;
  sessionStorage.removeItem('token');
};

export const getToken = () => {
  return authToken || sessionStorage.getItem('token');
};