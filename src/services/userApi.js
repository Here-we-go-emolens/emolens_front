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
