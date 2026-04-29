import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '@/services/userApi';
import { getAccessToken } from '@/services/auth';

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!getAccessToken()) return;
    getMe().then(setUser).catch(() => {});
  }, []);

  const clearUser = () => setUser(null);

  return (
    <UserContext.Provider value={{ user, setUser, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUserContext() {
  return useContext(UserContext);
}
