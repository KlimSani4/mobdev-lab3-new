/**
 * AuthContext.tsx - Контекст авторизации
 *
 * Предоставляет информацию о текущем пользователе всем компонентам.
 * Использует React Context API для глобального состояния.
 *
 * Поддерживает "гостевой режим" - пользователи могут просматривать задачи
 * без авторизации. Авторизация требуется только для создания задач,
 * откликов и просмотра профиля.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../config';
import { login as apiLogin, register as apiRegister, logout as apiLogout } from '../api/auth';
import { getCurrentUserProfile } from '../api/users';
import type { User } from '../types';

// Тип контекста авторизации
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isGuest: boolean; // true если пользователь не авторизован (гостевой режим)
  showLoginPrompt: boolean; // показывать ли модальное окно входа
  setShowLoginPrompt: (show: boolean) => void; // управление модальным окном
  login: (phone: string, password: string) => Promise<void>;
  register: (phone: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  requireAuth: () => boolean; // проверка авторизации, показывает промпт если не авторизован
}

// Создаём контекст
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Провайдер контекста
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Гостевой режим - пользователь не авторизован
  const isGuest = !user;

  // Проверка авторизации при запуске
  useEffect(() => {
    checkAuth();
  }, []);

  // Проверить, есть ли сохранённый токен
  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        const profile = await getCurrentUserProfile();
        setUser(profile);
      }
    } catch (e) {
      // Токен невалидный - очищаем
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    } finally {
      setLoading(false);
    }
  };

  // Вход в аккаунт
  const login = useCallback(async (phone: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const loggedInUser = await apiLogin(phone, password);
      setUser(loggedInUser);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ошибка входа';
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  // Регистрация
  const register = useCallback(async (phone: string, name: string, password: string) => {
    setError(null);
    setLoading(true);
    try {
      const newUser = await apiRegister(phone, name, password);
      setUser(newUser);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Ошибка регистрации';
      setError(message);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  // Выход
  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  // Обновить данные пользователя
  const refreshUser = useCallback(async () => {
    if (!user) return;
    try {
      const profile = await getCurrentUserProfile();
      setUser(profile);
    } catch (e) {
      // Игнорируем ошибки обновления
    }
  }, [user]);

  // Проверка авторизации - показывает промпт если не авторизован
  // Возвращает true если авторизован, false если гость
  const requireAuth = useCallback((): boolean => {
    if (user) {
      return true;
    }
    // Показываем модальное окно входа
    setShowLoginPrompt(true);
    return false;
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isGuest,
        showLoginPrompt,
        setShowLoginPrompt,
        login,
        register,
        logout,
        refreshUser,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Хук для использования контекста
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
