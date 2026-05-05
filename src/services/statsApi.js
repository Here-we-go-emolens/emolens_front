import apiClient from '@/services/apiClient';

/**
 * 통계 조회
 * @param {string} [month] - "2026-05" 형식, 생략 시 현재 달
 */
export const getStats = (month) =>
  apiClient.get('/api/stats', { params: month ? { month } : {} }).then((r) => r.data);
