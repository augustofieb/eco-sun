import { usersAPI } from '../services/api';

export const getUsers = async () => {
  try {
    const response = await usersAPI.getAll();
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const searchUsers = async (query) => {
  try {
    const response = await usersAPI.search(query);
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    return [];
  }
};

export const updateUser = async (id, user) => {
  try {
    const response = await usersAPI.update(id, user);
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
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