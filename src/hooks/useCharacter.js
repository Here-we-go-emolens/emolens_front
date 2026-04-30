import { useCallback, useEffect, useState } from 'react';
import { createCharacter, getMyCharacter, updateCharacter } from '@/services/characterApi';
import { getAccessToken } from '@/services/auth';

export function useCharacter() {
  const [character, setCharacter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(null);

  const fetchCharacter = useCallback(async () => {
    if (!getAccessToken()) {
      setCharacter(null);
      setNotFound(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getMyCharacter();
      setCharacter(data);
      setNotFound(false);
    } catch (err) {
      if (err.response?.status === 404) {
        setCharacter(null);
        setNotFound(true);
      } else {
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCharacter();
  }, [fetchCharacter]);

  const saveCharacter = useCallback(async (payload, mode) => {
    const saved = mode === 'edit'
      ? await updateCharacter(payload)
      : await createCharacter(payload);
    setCharacter(saved);
    setNotFound(false);
    return saved;
  }, []);

  return {
    character,
    loading,
    notFound,
    error,
    refreshCharacter: fetchCharacter,
    saveCharacter,
  };
}
