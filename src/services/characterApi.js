import apiClient from '@/services/apiClient';

export async function getMyCharacter() {
  const { data } = await apiClient.get('/api/characters');
  return data;
}

export async function createCharacter(payload) {
  const { data } = await apiClient.post('/api/characters', payload);
  return data;
}

export async function updateCharacter(payload) {
  const { data } = await apiClient.put('/api/characters', payload);
  return data;
}
