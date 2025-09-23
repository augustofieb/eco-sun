// Product management utilities using localStorage

export const getProducts = () => {
  const products = localStorage.getItem('products');
  return products ? JSON.parse(products) : [];
};

export const saveProducts = (products) => {
  localStorage.setItem('products', JSON.stringify(products));
};

export const addProduct = (productData) => {
  const products = getProducts();
  const newProduct = {
    id: Date.now(),
    ...productData,
    price: parseFloat(productData.price),
    image: productData.image || '/placeholder.jpg'
  };
  products.push(newProduct);
  saveProducts(products);
  return newProduct;
};

export const updateProduct = (productId, updatedData) => {
  const products = getProducts();
  const productIndex = products.findIndex(product => product.id === productId);
  if (productIndex !== -1) {
    products[productIndex] = { ...products[productIndex], ...updatedData, price: parseFloat(updatedData.price) };
    saveProducts(products);
    return products[productIndex];
  }
  return null;
};

export const deleteProduct = (productId) => {
  const products = getProducts();
  const filteredProducts = products.filter(product => product.id !== productId);
  saveProducts(filteredProducts);
};

export const getProductById = (productId) => {
  const products = getProducts();
  return products.find(product => product.id === productId);
};

export const getProductsByCategory = (category) => {
  const products = getProducts();
  if (category === 'all') return products;
  return products.filter(product => product.category === category);
};
