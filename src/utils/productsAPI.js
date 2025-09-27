import { productsAPI } from '../services/api';

export const getProducts = async () => {
  try {
    const response = await productsAPI.getAll();
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const getProductsByCategory = async (categoryId) => {
  try {
    if (categoryId === 'all') {
      return await getProducts();
    }
    const response = await productsAPI.getByCategory(categoryId);
    return response.data;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

export const searchProducts = async (query) => {
  try {
    const response = await productsAPI.search(query);
    return response.data;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

export const getProductById = async (id) => {
  try {
    const response = await productsAPI.getById(id);
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

export const createProduct = async (product) => {
  try {
    const response = await productsAPI.create(product);
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id, product) => {
  try {
    const response = await productsAPI.update(id, product);
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    await productsAPI.delete(id);
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};