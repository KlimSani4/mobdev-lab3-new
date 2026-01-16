/**
 * auth.ts - API функции для аутентификации
 *
 * Управляет регистрацией, входом и хранением токена.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './client';
import { STORAGE_KEYS } from '../config';
import type { User } from '../types';

// Ответ авторизации
interface AuthResponse {
  user: User;
  token: string;
}

/**
 * Регистрация нового пользователя
 */
export async function register(
  phone: string,
  name: string,
  password: string
): Promise<User> {
  const response = await api.post<AuthResponse>('/auth/register', {
    phone,
    name,
    password,
  });

  // Сохраняем токен
  await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);

  return response.user;
}

/**
 * Вход пользователя
 */
export async function login(phone: string, password: string): Promise<User> {
  const response = await api.post<AuthResponse>('/auth/login', {
    phone,
    password,
  });

  // Сохраняем токен
  await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);

  return response.user;
}

/**
 * Выход из аккаунта
 */
export async function logout(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
}

/**
 * Проверить, авторизован ли пользователь
 */
export async function isAuthenticated(): Promise<boolean> {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  return !!token;
}

/**
 * Получить токен авторизации
 */
export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}
