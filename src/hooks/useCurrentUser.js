import { useState, useEffect } from 'react';
import { getMe } from '@/services/userApi';

export function useCurrentUser() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getMe().then(setUser).catch(() => {});
  }, []);

  return user;
}
