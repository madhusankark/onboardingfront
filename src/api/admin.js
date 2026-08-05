import api from './client';

export const getProviders = (params) => api.get('/admin/providers', { params });
export const getProviderDetail = (id) => api.get(`/admin/providers/${id}`);
export const reviewApplication = (id, payload) => api.put(`/admin/providers/${id}/review`, payload);
export const reviewDocument = (providerId, docId, payload) =>
  api.put(`/admin/providers/${providerId}/documents/${docId}/review`, payload);
export const removeDocument = (providerId, docId, payload) =>
  api.delete(`/admin/providers/${providerId}/documents/${docId}`, { data: payload });
export const getDashboard = () => api.get('/admin/dashboard');
export const getAdminCategories = () => api.get('/admin/categories');
export const createCategory = (payload) => api.post('/admin/categories', payload);
export const getAdminServices = () => api.get('/admin/services');
export const createServiceItem = (payload) => api.post('/admin/services', payload);
export const updateServiceItem = (id, payload) => api.put(`/admin/services/${id}`, payload);
export const deleteServiceItem = (id) => api.delete(`/admin/services/${id}`);
export const getAdminBookings = () => api.get('/admin/bookings');
export const updateAdminBookingStatus = (id, payload) => api.put(`/admin/bookings/${id}`, payload);