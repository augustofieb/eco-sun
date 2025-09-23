import { authAPI } from '../services/api';

export const loginUser = async (email, password) => {
  try {
    const response = await authAPI.login(email, password);
    const { token, nome, email: userEmail, nivelAcesso } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ 
      id: Date.now(), 
      name: nome, 
      email: userEmail, 
      nivelAcesso 
    }));
    
    return { success: true, user: { name: nome, email: userEmail, nivelAcesso } };
  } catch (error) {
    return { success: false, error: 'Credenciais inválidas' };
  }
};

export const registerUser = async (name, email, password) => {
  try {
    const response = await authAPI.register(name, email, password);
    const { token, nome, email: userEmail, nivelAcesso } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ 
      id: Date.now(), 
      name: nome, 
      email: userEmail, 
      nivelAcesso 
    }));
    
    return { success: true, user: { name: nome, email: userEmail, nivelAcesso } };
  } catch (error) {
    return { success: false, error: 'Erro ao criar conta' };
  }
};

export const isLoggedIn = () => {
  return localStorage.getItem('token') !== null;
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.nivelAcesso === 'ADMIN';
};

export const logoutUser = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};