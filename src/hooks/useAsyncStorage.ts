/**
 * useAsyncStorage - универсальный хук для работы с AsyncStorage
 *
 * AsyncStorage - это асинхронное key-value хранилище для React Native,
 * аналог localStorage в браузере, но асинхронный.
 *
 * Особенности:
 * - Данные сохраняются между запусками приложения
 * - Поддерживает только строки (JSON.stringify/parse для объектов)
 * - Асинхронный API (все операции возвращают Promise)
 *
 * @template T - тип хранимого значения
 * @param key - уникальный ключ для хранения
 * @param initialValue - начальное значение (до загрузки из storage)
 */
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Типизированный интерфейс возвращаемого значения
interface UseAsyncStorageResult<T> {
  value: T | null;       // Текущее значение из storage
  loading: boolean;      // Флаг загрузки
  error: Error | null;   // Ошибка операции
  setValue: (newValue: T) => Promise<void>;   // Функция сохранения
  removeValue: () => Promise<void>;            // Функция удаления
}

export function useAsyncStorage<T>(
  key: string,
  initialValue: T | null = null
): UseAsyncStorageResult<T> {
  // Локальное состояние для значения
  const [value, setValueState] = useState<T | null>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * useEffect для загрузки данных из AsyncStorage при монтировании
   * Зависимость от key означает перезагрузку при смене ключа
   */
  useEffect(() => {
    let isMounted = true; // Флаг для предотвращения утечек памяти

    const loadValue = async () => {
      try {
        // AsyncStorage.getItem возвращает строку или null
        const storedValue = await AsyncStorage.getItem(key);
        if (isMounted) {
          if (storedValue !== null) {
            // Парсим JSON обратно в объект типа T
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

    // Cleanup: отменяем обновления после размонтирования
    return () => {
      isMounted = false;
    };
  }, [key]); // Перезагружаем при изменении ключа

  /**
   * setValue - сохраняет новое значение в AsyncStorage
   * Мемоизирована через useCallback для стабильной ссылки
   */
  const setValue = useCallback(
    async (newValue: T) => {
      try {
        setError(null);
        // Сериализуем объект в JSON строку для хранения
        await AsyncStorage.setItem(key, JSON.stringify(newValue));
        // Обновляем локальное состояние
        setValueState(newValue);
      } catch (e) {
        setError(e instanceof Error ? e : new Error('Ошибка сохранения данных'));
        throw e; // Пробрасываем ошибку для обработки в компоненте
      }
    },
    [key]
  );

  /**
   * removeValue - удаляет значение из AsyncStorage
   */
  const removeValue = useCallback(async () => {
    try {
      setError(null);
      await AsyncStorage.removeItem(key);
      setValueState(null); // Сбрасываем локальное состояние
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Ошибка удаления данных'));
      throw e;
    }
  }, [key]);

  return { value, loading, error, setValue, removeValue };
}
