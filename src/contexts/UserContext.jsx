import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '@/services/userApi';
import { getAccessToken, clearTokens } from '@/services/auth';
import { useNotificationSSE } from '@/hooks/useNotificationSSE';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!getAccessToken()) return;
    getMe().then(setUser).catch((err) => {
      if (err?.response?.status === 401) {
        clearTokens();
        window.location.href = '/login';
      }
    });
  }, []);

  // 새 알림 도착 시 DOM 이벤트로 브로드캐스트 → 사이드바 등에서 구독
  useNotificationSSE((notification) => {
    window.dispatchEvent(new CustomEvent('notification-new', { detail: notification }));
  });

  const clearUser = () => setUser(null);

  return (
    <UserContext.Provider value={{ user, setUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUserContext() {
  return useContext(UserContext);
}
