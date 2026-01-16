/**
 * config.ts - Конфигурация приложения
 *
 * API_URL - адрес бэкенда для всех платформ.
 * Сервер развёрнут на 95.217.198.43:8765
 */

// Публичный API сервер
// API через отдельный домен (фронт на GitHub Pages)
export const API_URL = 'https://sosedi.prdxso.dev/api';

// Таймаут запросов (мс)
export const REQUEST_TIMEOUT = 10000;

// Ключи для AsyncStorage
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@neighbors_plus/auth_token',
  USER_PROFILE: '@neighbors_plus/user_profile',
  CACHED_TASKS: '@neighbors_plus/cached_tasks',
} as const;
