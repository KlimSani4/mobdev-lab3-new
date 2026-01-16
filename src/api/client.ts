/**
 * client.ts - HTTP клиент для работы с API
 *
 * Обёртка над fetch с:
 * - Автоматическим добавлением заголовков
 * - Обработкой токена авторизации
 * - Обработкой ошибок
 * - Таймаутом запросов
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, REQUEST_TIMEOUT, STORAGE_KEYS } from '../config';

// Типы HTTP методов
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Опции запроса
interface RequestOptions {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
}

// Ошибка API с дополнительной информацией
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Получить токен авторизации из хранилища
 */
async function getAuthToken(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  } catch {
    return null;
  }
}

/**
 * Основная функция для HTTP запросов
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {}, timeout = REQUEST_TIMEOUT } = options;

  // Формируем URL
  const url = `${API_URL}${endpoint}`;

  // Получаем токен авторизации
  const token = await getAuthToken();

  // Формируем заголовки
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Добавляем токен если есть
  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
  }

  // Создаём AbortController для таймаута
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Парсим ответ
    const data = response.status !== 204 ? await response.json() : null;

    // Проверяем успешность
    if (!response.ok) {
      throw new ApiError(
        data?.error || data?.message || 'Ошибка сервера',
        response.status,
        data
      );
    }

    return data as T;
  } catch (error) {
    clearTimeout(timeoutId);

    // Обработка таймаута
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Превышено время ожидания', 408);
    }

    // Обработка сетевых ошибок
    if (error instanceof TypeError && error.message === 'Network request failed') {
      throw new ApiError('Нет подключения к серверу', 0);
    }

    // Пробрасываем ApiError
    if (error instanceof ApiError) {
      throw error;
    }

    // Другие ошибки
    throw new ApiError(
      error instanceof Error ? error.message : 'Неизвестная ошибка',
      500
    );
  }
}

// Удобные методы для разных типов запросов
export const api = {
  get: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};
