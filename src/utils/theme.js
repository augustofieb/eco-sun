// Theme management utilities using localStorage

export const getTheme = () => {
  return localStorage.getItem('theme') || 'light'
}

export const setTheme = (theme) => {
  localStorage.setItem('theme', theme)
  document.body.className = theme === 'dark' ? 'dark-mode' : ''
}

export const initTheme = () => {
  const theme = getTheme()
  document.body.className = theme === 'dark' ? 'dark-mode' : ''
}