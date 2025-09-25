// Categories utility - now using hardcoded categories
// In the future, this could be replaced with API calls

export const getCategories = () => {
  return ['painéis', 'inversores', 'baterias', 'controladores'];
};

export const addCategory = (categoryName) => {
  // This would be implemented with API in the future
  console.log('Add category functionality not implemented yet');
  return false;
};