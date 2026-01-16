/**
 * users.ts - API функции для работы с пользователями
 *
 * Использует HTTP клиент для запросов к бэкенду.
 */

import { api } from './client';
import type { User } from '../types';

/**
 * Получить пользователя по ID
 */
export async function getUserById(id: string): Promise<User | null> {
  try {
    const user = await api.get<User>(`/users/${id}`);
    return normalizeUser(user);
  } catch {
    return null;
  }
}

/**
 * Получить текущего авторизованного пользователя
 */
export async function getCurrentUserProfile(): Promise<User> {
  const user = await api.get<User>('/auth/me');
  return normalizeUser(user);
}

/**
 * Обновить профиль пользователя
 */
export async function updateUserProfile(
  id: string,
  updates: Partial<Pick<User, 'name' | 'avatar' | 'phone'>>
): Promise<User> {
  const user = await api.patch<User>(`/users/${id}`, updates);
  return normalizeUser(user);
}

/**
 * Изменить карму пользователя
 * @param id - ID пользователя
 * @param delta - изменение кармы (положительное или отрицательное)
 */
export async function updateKarma(id: string, delta: number): Promise<User> {
  const user = await api.patch<User>(`/users/${id}/karma`, { delta });
  return normalizeUser(user);
}

/**
 * Получить задачи пользователя
 */
export async function getUserTasks(id: string): Promise<any[]> {
  return api.get(`/users/${id}/tasks`);
}

/**
 * Нормализация данных пользователя
 */
function normalizeUser(user: any): User {
  return {
    id: user.id,
    name: user.name,
    phone: user.phone,
    avatar: user.avatar,
    karma: user.karma,
    level: user.level,
    createdAt: user.createdAt,
    _count: user._count,
  };
}
