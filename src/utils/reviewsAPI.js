import { reviewsAPI } from '../services/api';

export const getReviewsByProduct = async (produtoId) => {
  try {
    const response = await reviewsAPI.getByProduct(produtoId);
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
};

export const createReview = async (reviewData) => {
  try {
    const response = await reviewsAPI.create(reviewData);
    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

export const deleteReview = async (id) => {
  try {
    await reviewsAPI.delete(id);
    return true;
  } catch (error) {
    console.error('Error deleting review:', error);
    throw error;
  }
};