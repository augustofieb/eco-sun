// User management utilities using localStorage

export const getAllUsers = () => {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
};

export const saveUsers = (users) => {
  localStorage.setItem('users', JSON.stringify(users));
};

export const deleteUser = (userId) => {
  const users = getAllUsers();
  const filteredUsers = users.filter(user => user.id !== userId);
  saveUsers(filteredUsers);
};

export const updateUser = (userId, updatedData) => {
  const users = getAllUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...updatedData };
    saveUsers(users);
    return users[userIndex];
  }
  return null;
};

export const toggleAdmin = (userId) => {
  const users = getAllUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    users[userIndex].isAdmin = !users[userIndex].isAdmin;
    saveUsers(users);
    return users[userIndex];
  }
  return null;
};

export const addUser = (userData) => {
  const users = getAllUsers();
  const newUser = {
    id: Date.now(),
    ...userData,
    isAdmin: false
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
};

export const isAdmin = () => {
  const user = getCurrentUser();
  return user && user.isAdmin;
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user) => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

export const logoutUser = () => {
  localStorage.removeItem('currentUser');
};

export const updateUserProfile = (userId, profileData) => {
  const users = getAllUsers();
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex !== -1) {
    users[userIndex] = { ...users[userIndex], ...profileData };
    saveUsers(users);
    return users[userIndex];
  }
  return null;
};
