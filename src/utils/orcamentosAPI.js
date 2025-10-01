import { orcamentosAPI } from '../services/api';

export const getOrcamentosByUser = async (usuarioId) => {
  try {
    const response = await orcamentosAPI.getByUser(usuarioId);
    return response.data;
  } catch (error) {
    console.error('Error fetching orcamentos:', error);
    return [];
  }
};

export const createOrcamento = async (orcamentoData) => {
  try {
    const response = await orcamentosAPI.create(orcamentoData);
    return response.data;
  } catch (error) {
    console.error('Error creating orcamento:', error);
    throw error;
  }
};

export const updateOrcamento = async (id, orcamentoData) => {
  try {
    const response = await orcamentosAPI.update(id, orcamentoData);
    return response.data;
  } catch (error) {
    console.error('Error updating orcamento:', error);
    throw error;
  }
};

export const deleteOrcamento = async (id) => {
  try {
    await orcamentosAPI.delete(id);
    return true;
  } catch (error) {
    console.error('Error deleting orcamento:', error);
    throw error;
  }
};