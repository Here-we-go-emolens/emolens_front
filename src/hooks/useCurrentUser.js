import { useUserContext } from '@/contexts/UserContext';

export function useCurrentUser() {
  return useUserContext().user;
}
