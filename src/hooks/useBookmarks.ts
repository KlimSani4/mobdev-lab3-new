/**
 * useBookmarks - хук для работы с закладками (сохраненные задачи)
 *
 * Сохраняет закладки в AsyncStorage для персистентности.
 * Предоставляет методы для добавления/удаления закладок.
 */
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = '@neighbors_plus/bookmarks';

interface UseBookmarksResult {
  /** Массив ID сохраненных задач */
  bookmarks: string[];
  /** Добавить или убрать задачу из закладок */
  toggleBookmark: (taskId: string) => void;
  /** Проверить, находится ли задача в закладках */
  isBookmarked: (taskId: string) => boolean;
  /** Загрузка данных */
  loading: boolean;
}

export function useBookmarks(): UseBookmarksResult {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Загрузка закладок при монтировании
  useEffect(() => {
    loadBookmarks();
  }, []);

  // Загрузить закладки из хранилища
  const loadBookmarks = async () => {
    try {
      const stored = await AsyncStorage.getItem(BOOKMARKS_KEY);
      if (stored) {
        setBookmarks(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Сохранить закладки в хранилище
  const saveBookmarks = async (newBookmarks: string[]) => {
    try {
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(newBookmarks));
    } catch (error) {
      console.error('Failed to save bookmarks:', error);
    }
  };

  // Добавить/удалить закладку
  const toggleBookmark = useCallback((taskId: string) => {
    setBookmarks(prev => {
      const isCurrentlyBookmarked = prev.includes(taskId);
      const newBookmarks = isCurrentlyBookmarked
        ? prev.filter(id => id !== taskId)
        : [...prev, taskId];

      // Сохраняем асинхронно
      saveBookmarks(newBookmarks);

      return newBookmarks;
    });
  }, []);

  // Проверить, в закладках ли задача
  const isBookmarked = useCallback((taskId: string): boolean => {
    return bookmarks.includes(taskId);
  }, [bookmarks]);

  return {
    bookmarks,
    toggleBookmark,
    isBookmarked,
    loading,
  };
}
