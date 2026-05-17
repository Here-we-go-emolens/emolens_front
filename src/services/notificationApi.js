import apiClient from './apiClient';

export const getNotifications = () =>
  apiClient.get('/api/notifications').then(r => r.data);

// 백엔드 엔드포인트: GET /api/notifications/count → { count: N }
export const getUnreadNotificationCount = () =>
  apiClient.get('/api/notifications/count').then(r => r.data.count);

export const markAsRead = (id) =>
  apiClient.patch(`/api/notifications/${id}/read`);

export const markAllAsRead = () =>
  apiClient.patch('/api/notifications/read-all');
