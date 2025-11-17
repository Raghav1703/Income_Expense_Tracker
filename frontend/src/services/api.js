import axios from "axios";

// 🔗 Make sure this matches backend
const BASE_URL = process.env.REACT_APP_API_URL + "/";

// -------- Existing Functions (UNCHANGED) ---------
export const getTransactions = async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
};

export const addTransaction = async (transaction) => {
  const response = await axios.post(BASE_URL, transaction);
  return response.data;
};

export const deleteTransaction = async (id) => {
  await axios.delete(`${BASE_URL}${id}`);
  return { success: true };
};

// -------- NEW AI ENDPOINTS (NON-BREAKING) ---------

export const getAIInsights = async () => {
  const response = await axios.get(`${BASE_URL}ai/insights`);
  return response.data;
};

export const semanticSearch = async (query) => {
  const response = await axios.post(`${BASE_URL}ai/search`, { query });
  return response.data;
};

// Default
const api = { getTransactions, addTransaction, deleteTransaction, getAIInsights, semanticSearch };
export default api;
