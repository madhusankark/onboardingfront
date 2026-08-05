import api from './client';

export const getProfile = () => api.get('/provider/profile');
export const updateProfile = (data) => api.put('/provider/profile', data);
export const submitApplication = () => api.post('/provider/submit');
export const getStatus = () => api.get('/provider/status');
export const getCategories = () => api.get('/provider/categories');
export const uploadDocuments = (formData) => api.post('/provider/documents', formData);
export const deleteDocument = (id) => api.delete(`/provider/documents/${id}`);