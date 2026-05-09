import apiClient from './apiClient';

export const getWeeklyReports = () =>
  apiClient.get('/api/weekly-reports').then((r) => r.data);

export const completeAction = (id) =>
  apiClient.post(`/api/weekly-reports/${id}/complete`).then((r) => r.data);
