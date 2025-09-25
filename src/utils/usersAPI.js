import { usersAPI } from '../services/api';

export const getAllUsers = async () => {
  try {
    const response = await usersAPI.getAll();
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const getUserById = async (id) => {
  try {
    const response = await usersAPI.getById(id);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await usersAPI.update(id, userData);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const toggleAdmin = async (id) => {
  try {
    const response = await usersAPI.toggleAdmin(id);
    return response.data;
  } catch (error) {
    console.error('Error toggling admin:', error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    await usersAPI.delete(id);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};