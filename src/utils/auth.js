// Auth utilities with localStorage fallback
export const registerUser = (userData) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  
  if (users.find(user => user.email === userData.email)) {
    throw new Error('Usuário já existe com este email')
  }
  
  const newUser = {
    id: Date.now(),
    name: userData.name,
    email: userData.email,
    password: userData.password,
    isAdmin: users.length === 0,
    createdAt: new Date().toISOString()
  }
  
  users.push(newUser)
  localStorage.setItem('users', JSON.stringify(users))
  return newUser
}

export const loginUser = (email, password) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  const user = users.find(u => u.email === email && u.password === password)
  
  if (!user) {
    throw new Error('Email ou senha incorretos')
  }
  
  localStorage.setItem('currentUser', JSON.stringify(user))
  return user
}

export const getCurrentUser = () => {
  const userData = localStorage.getItem('user')
  if (userData) return JSON.parse(userData)
  
  return JSON.parse(localStorage.getItem('currentUser') || 'null')
}

export const isLoggedIn = () => {
  return localStorage.getItem('token') !== null || getCurrentUser() !== null
}

export const isAdmin = () => {
  const user = getCurrentUser()
  return user && (user.nivelAcesso === 'ADMIN' || user.isAdmin)
}