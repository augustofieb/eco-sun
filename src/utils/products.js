// Product management utilities using localStorage

export const getProducts = () => {
  return JSON.parse(localStorage.getItem('products') || '[]')
}

export const addProduct = (product) => {
  const products = getProducts()
  const newProduct = {
    id: Date.now(),
    ...product,
    createdAt: new Date().toISOString()
  }
  products.push(newProduct)
  localStorage.setItem('products', JSON.stringify(products))
  return newProduct
}

export const updateProduct = (productId, updates) => {
  const products = getProducts()
  const productIndex = products.findIndex(product => product.id === productId)
  if (productIndex !== -1) {
    products[productIndex] = { ...products[productIndex], ...updates }
    localStorage.setItem('products', JSON.stringify(products))
  }
}

export const deleteProduct = (productId) => {
  const products = getProducts()
  const filteredProducts = products.filter(product => product.id !== productId)
  localStorage.setItem('products', JSON.stringify(filteredProducts))
}

export const getProductsByCategory = (category) => {
  const products = getProducts()
  return category === 'all' ? products : products.filter(product => product.category === category)
}