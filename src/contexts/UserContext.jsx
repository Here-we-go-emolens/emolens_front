import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '@/services/userApi';
import { getAccessToken, clearTokens } from '@/services/auth';

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
