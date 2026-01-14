import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UseAsyncStorageResult<T> {
  value: T | null;
  loading: boolean;
  error: Error | null;
  setValue: (newValue: T) => Promise<void>;
  removeValue: () => Promise<void>;
}

export function useAsyncStorage<T>(
  key: string,
  initialValue: T | null = null
): UseAsyncStorageResult<T> {
  const [value, setValueState] = useState<T | null>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadValue = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(key);
        if (isMounted) {
          if (storedValue !== null) {
            setValueState(JSON.parse(storedValue));
          }
          setLoading(false);
        }
      } catch (e) {
        if (isMounted) {
          setError(e instanceof Error ? e : new Error('Ошибка чтения данных'));
          setLoading(false);
        }
      }
    };

    loadValue();

    return () => {
      isMounted = false;
    };
  }, [key]);

  const setValue = useCallback(
    async (newValue: T) => {
      try {
        setError(null);
        await AsyncStorage.setItem(key, JSON.stringify(newValue));
        setValueState(newValue);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Ошибка сохранения данных'));
        throw e;
      }
    },
    [key]
  );

  const removeValue = useCallback(async () => {
    try {
      setError(null);
      await AsyncStorage.removeItem(key);
      setValueState(null);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Ошибка удаления данных'));
      throw e;
    }
  }, [key]);

  return { value, loading, error, setValue, removeValue };
}
