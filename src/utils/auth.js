// Simple authentication utilities using localStorage

export const registerUser = (userData) => {
  const users = JSON.parse(localStorage.getItem('users') || '[]')
  
  // Check if user already exists
  if (users.find(user => user.email === userData.email)) {
    throw new Error('Usuário já existe com este email')
  }
  
  // Add new user
  const newUser = {
    id: Date.now(),
    name: userData.name,
    email: userData.email,
    password: userData.password, // In real app, this should be hashed
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
  
  // Store current user session
  localStorage.setItem('currentUser', JSON.stringify(user))
  return user
}

export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('currentUser') || 'null')
}

export const logoutUser = () => {
  localStorage.removeItem('currentUser')
}

export const isLoggedIn = () => {
  return getCurrentUser() !== null
}