// Theme management utilities using API
import { preferencesAPI } from '../services/api';
import { isLoggedIn } from './authAPI';

let currentTheme = 'light';

export const getTheme = async () => {
  if (!isLoggedIn()) {
    return currentTheme;
  }
  
  try {
    const response = await preferencesAPI.get();
    currentTheme = response.data.tema || 'light';
    return currentTheme;
  } catch (error) {
    return currentTheme;
  }
}

export const setTheme = async (theme) => {
  currentTheme = theme;
  document.body.className = theme === 'dark' ? 'dark-mode' : '';
  
  if (isLoggedIn()) {
    try {
      await preferencesAPI.update({ tema: theme });
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  }
}

export const initTheme = async () => {
  const theme = await getTheme();
  document.body.className = theme === 'dark' ? 'dark-mode' : '';
}