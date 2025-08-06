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
    isAdmin: users.length === 0, // First user is admin
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

export const isAdmin = () => {
  const user = getCurrentUser()
  return user && user.isAdmin
}

export const getAllUsers = () => {
  return JSON.parse(localStorage.getItem('users') || '[]')
}

export const deleteUser = (userId) => {
  const users = getAllUsers()
  const filteredUsers = users.filter(user => user.id !== userId)
  localStorage.setItem('users', JSON.stringify(filteredUsers))
}

export const updateUser = (userId, updates) => {
  const users = getAllUsers()
  const userIndex = users.findIndex(user => user.id === userId)
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updates }
    localStorage.setItem('users', JSON.stringify(users))
  }
}

export const toggleAdmin = (userId) => {
  const users = getAllUsers()
  const userIndex = users.findIndex(user => user.id === userId)
  if (userIndex !== -1) {
    users[userIndex].isAdmin = !users[userIndex].isAdmin
    localStorage.setItem('users', JSON.stringify(users))
  }
}

export const grantAdminByEmail = (email) => {
  const users = getAllUsers()
  const userIndex = users.findIndex(user => user.email === email)
  if (userIndex !== -1) {
    users[userIndex].isAdmin = true
    localStorage.setItem('users', JSON.stringify(users))
    return true
  }
  return false
}

export const updateUserProfile = (userId, profileData) => {
  const users = getAllUsers()
  const userIndex = users.findIndex(user => user.id === userId)
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...profileData }
    localStorage.setItem('users', JSON.stringify(users))
    
    // Update current user session if it's the same user
    const currentUser = getCurrentUser()
    if (currentUser && currentUser.id === userId) {
      localStorage.setItem('currentUser', JSON.stringify(users[userIndex]))
    }
    return users[userIndex]
  }
  return null
}