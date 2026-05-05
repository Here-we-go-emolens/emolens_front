import apiClient from '@/services/apiClient';

export const getLetters = () =>
  apiClient.get('/api/letters').then((r) => r.data);

export const getUnreadCount = () =>
  apiClient.get('/api/letters/unread-count').then((r) => r.data);

export const getLetter = (id) =>
  apiClient.get(`/api/letters/${id}`).then((r) => r.data);
