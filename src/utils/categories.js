import { categoriesAPI } from '../services/api';

export const getCategories = async () => {
  try {
    const response = await categoriesAPI.getAll();
    return response.data.map(cat => ({ id: cat.id, name: cat.nome }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Fallback to hardcoded categories
    return [
      { id: 1, name: 'painéis' },
      { id: 2, name: 'inversores' },
      { id: 3, name: 'baterias' },
      { id: 4, name: 'controladores' }
    ];
  }
};

export const addCategory = async (nome, descricao = '') => {
  try {
    const response = await categoriesAPI.create({ nome, descricao });
    return response.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

export const searchCategories = async (query) => {
  try {
    const response = await categoriesAPI.search(query);
    return response.data;
  } catch (error) {
    console.error('Error searching categories:', error);
    return [];
  }
};