// Theme management utilities using API
import { preferencesAPI } from '../services/api';
import { isLoggedIn } from './authAPI';

const THEME_STORAGE_KEY = 'eco-sun-theme';

const normalizeTheme = (theme) => (theme === 'dark' ? 'dark' : 'light');

const getStoredTheme = () => normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY) || 'light');

let currentTheme = getStoredTheme();

const applyThemeToDocument = (theme) => {
  const normalizedTheme = normalizeTheme(theme);
  currentTheme = normalizedTheme;
  document.body.classList.toggle('dark-mode', normalizedTheme === 'dark');
  localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
};

export const getTheme = async () => {
  const storedTheme = getStoredTheme();

  if (!isLoggedIn()) {
    return storedTheme;
  }

  try {
    const response = await preferencesAPI.get();
    const serverTheme = response?.data?.tema;
    if (serverTheme) {
      const normalizedServerTheme = normalizeTheme(serverTheme);
      const activeTheme = normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY) || normalizedServerTheme);
      applyThemeToDocument(activeTheme);
      return currentTheme;
    }
    return storedTheme;
  } catch (error) {
    return storedTheme;
  }
};

export const setTheme = async (theme) => {
  const normalizedTheme = normalizeTheme(theme);
  applyThemeToDocument(normalizedTheme);

  if (isLoggedIn()) {
    try {
      await preferencesAPI.update({ tema: normalizedTheme });
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  }
};

export const initTheme = async () => {
  const theme = await getTheme();
  applyThemeToDocument(theme);
};