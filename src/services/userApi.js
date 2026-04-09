import { getAccessToken } from '@/services/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getMe() {
  const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  if (!res.ok) throw new Error('사용자 정보를 불러오지 못했습니다.');
  return res.json();
}
