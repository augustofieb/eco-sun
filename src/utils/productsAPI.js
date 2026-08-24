import { productsAPI } from '../services/api';

const CACHE_TTL = 30000;
const responseCache = new Map();
const pendingRequests = new Map();

const getCached = async (key, request) => {
  const cached = responseCache.get(key);
  if (cached && cached.expiresAt > Date.now()) return cached.data;

  if (pendingRequests.has(key)) return pendingRequests.get(key);

  const pending = request().then((data) => {
    responseCache.set(key, { data, expiresAt: Date.now() + CACHE_TTL });
    return data;
  }).finally(() => pendingRequests.delete(key));

  pendingRequests.set(key, pending);
  return pending;
};

export const invalidateProductsCache = () => responseCache.clear();

export const getProducts = async () => {
  try {
    return await getCached('all', async () => {
      const response = await productsAPI.getAll();
      return response.data;
    });
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
    return await getCached(`category:${categoryId}`, async () => {
      const response = await productsAPI.getByCategory(categoryId);
      return response.data;
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
};

export const searchProducts = async (query, signal) => {
  try {
    return await getCached(`search:${query.trim().toLowerCase()}`, async () => {
      const response = await productsAPI.search(query, { signal });
      return response.data;
    });
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
    invalidateProductsCache();
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (id, product) => {
  try {
    const response = await productsAPI.update(id, product);
    invalidateProductsCache();
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    await productsAPI.delete(id);
    invalidateProductsCache();
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};