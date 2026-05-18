import apiClient from '@/services/apiClient';
import { clearTokens } from '@/services/auth';

export const getMe = () => apiClient.get('/api/auth/me').then((r) => r.data);

export const logout = async () => {
  try {
    await apiClient.post('/api/auth/logout');
  } finally {
    clearTokens();
    window.location.href = '/login';
  }
};

export const updateProfile = ({ name, bio, profileImageUrl }) =>
  apiClient.patch('/api/users/profile', { name, bio, profileImageUrl });

export const uploadProfileImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('directory', 'profile');
  return apiClient.post('/api/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data.url);
};

export const changePassword = ({ currentPassword, newPassword }) =>
  apiClient.patch('/api/users/password', { currentPassword, newPassword });

export const withdraw = async () => {
  await apiClient.delete('/api/users/me');
  clearTokens();
  window.location.href = '/login';
};

export const upgradePlan = () =>
  apiClient.post('/api/users/plan/upgrade');

// 필드 매핑: 프론트(camelCase) ↔ 백엔드(snake_case)
// friendActivity → notify_friend_activity (백엔드 컬럼 추가 필요)
export const getNotificationSettings = () =>
  apiClient.get('/api/users/notification-settings').then(r => ({
    dailyReminder:  r.data.notify_daily_reminder  ?? true,
    aiAnalysisDone: r.data.notify_ai_analysis     ?? true,
    weeklyReport:   r.data.notify_weekly_report   ?? false,
    friendActivity: r.data.notify_friend_activity ?? false,
  }));

export const updateNotificationSettings = (settings) =>
  apiClient.patch('/api/users/notification-settings', {
    notify_daily_reminder:  settings.dailyReminder,
    notify_ai_analysis:     settings.aiAnalysisDone,
    notify_weekly_report:   settings.weeklyReport,
    notify_friend_activity: settings.friendActivity,
  });
