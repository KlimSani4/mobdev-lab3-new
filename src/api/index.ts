/**
 * API модуль - экспортирует все функции для работы с бэкендом
 */

export * from './tasks';
export * from './users';
export * from './auth';
export { api, ApiError } from './client';
export { defaultUserProfile, mockTasks, mockUsers, mockResponses } from './mockData';
