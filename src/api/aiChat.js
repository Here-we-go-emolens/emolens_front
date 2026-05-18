import apiClient from '@/services/apiClient';

export async function getAiResponse(messages) {
  const { data } = await apiClient.post('/api/chat/message', { messages });
  return data.reply;
}

export async function previewChat(messages) {
  const { data } = await apiClient.post('/api/chat/preview', { messages });
  return data; // { title, content }
}

export async function finishChat(messages) {
  const { data } = await apiClient.post('/api/chat/finish', { messages });
  return data;
}
