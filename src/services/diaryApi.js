import apiClient from '@/services/apiClient';

export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('directory', 'diary');
  return apiClient.post('/api/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data.url);
};

export const createDiary = (data) =>
  apiClient.post('/api/diaries', data).then((r) => r.data);

export const getDiaryList = (page = 0, size = 20) =>
  apiClient.get('/api/diaries', { params: { page, size } }).then((r) => r.data);

export const getDiary = (id) =>
  apiClient.get(`/api/diaries/${id}`).then((r) => r.data);

export const updateDiary = (id, data) =>
  apiClient.post(`/api/diaries/${id}/update`, data).then((r) => r.data);

export const deleteDiary = (id) =>
  apiClient.post(`/api/diaries/${id}/delete`).then((r) => r.data);
