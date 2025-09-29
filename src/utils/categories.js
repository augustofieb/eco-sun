import { categoriesAPI } from '../services/api';

export const getCategories = async () => {
  try {
    const response = await categoriesAPI.getAll();
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    // Fallback to hardcoded categories
    return [
      { id: 1, nome: 'painéis', descricao: 'Painéis solares' },
      { id: 2, nome: 'inversores', descricao: 'Inversores de energia' },
      { id: 3, nome: 'baterias', descricao: 'Baterias solares' },
      { id: 4, nome: 'controladores', descricao: 'Controladores de carga' }
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

export const deleteCategory = async (id) => {
  try {
    const response = await categoriesAPI.delete(id);
    return response.data;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

export const getConteudo = async (chave) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:8081/api/conteudo/${chave}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error fetching content:', error);
    return null;
  }
};

export const updateConteudo = async (chave, conteudo) => {
  try {
    const response = await fetch(`http://localhost:8081/api/produtos/conteudo/${chave}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ conteudo })
    });
    return response.ok;
  } catch (error) {
    console.error('Error updating content:', error);
    return false;
  }
};