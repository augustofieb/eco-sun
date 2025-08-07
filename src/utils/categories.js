// Category management utilities using localStorage

export const getCategories = () => {
  const defaultCategories = ['paineis', 'inversores', 'baterias', 'acessorios']
  const stored = localStorage.getItem('categories')
  return stored ? JSON.parse(stored) : defaultCategories
}

export const addCategory = (categoryName) => {
  const categories = getCategories()
  if (!categories.includes(categoryName.toLowerCase())) {
    categories.push(categoryName.toLowerCase())
    localStorage.setItem('categories', JSON.stringify(categories))
    return true
  }
  return false
}

export const deleteCategory = (categoryName) => {
  const categories = getCategories()
  const filtered = categories.filter(cat => cat !== categoryName)
  localStorage.setItem('categories', JSON.stringify(filtered))
}