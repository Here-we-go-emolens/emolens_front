import apiClient from '@/services/apiClient';

export async function getAiResponse(messages) {
  const { data } = await apiClient.post('/api/chat/message', { messages });
  return data.reply;
}

export async function finishChat(messages) {
  const { data } = await apiClient.post('/api/chat/finish', { messages });
  return data; // diaryId
}
