import api from './api';

export const transactionGroupService = {
  // Get all transaction groups
  getAll: () => api.get('/transaction-groups'),
  
  // Get transaction groups options for dropdown
  getOptions: (type = 'both') => api.get('/transaction-groups/options', { params: { type } }),
  
  // Create new transaction group
  create: (data) => api.post('/transaction-groups', data),
  
  // Get transaction group by id
  getById: (id) => api.get(`/transaction-groups/${id}`),
  
  // Update transaction group
  update: (id, data) => api.put(`/transaction-groups/${id}`, data),
  
  // Delete transaction group
  delete: (id) => api.delete(`/transaction-groups/${id}`),
};
