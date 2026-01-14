import type { TaskCategory, TaskStatus } from '../types';

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  delivery: 'Доставка',
  tools: 'Инструменты',
  pets: 'Питомцы',
  other: 'Другое',
};

export const CATEGORY_ICONS: Record<TaskCategory, string> = {
  delivery: '📦',
  tools: '🔧',
  pets: '🐾',
  other: '📋',
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  open: 'Открыта',
  in_progress: 'В работе',
  closed: 'Закрыта',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  open: '#4CAF50',
  in_progress: '#FF9800',
  closed: '#9E9E9E',
};

export const KARMA_THRESHOLDS = {
  NEWCOMER: 0,
  NEIGHBOR: 50,
  HELPER: 200,
  LEGEND: 500,
} as const;

export const STORAGE_KEYS = {
  USER_PROFILE: '@neighbors_plus/user_profile',
  CACHED_TASKS: '@neighbors_plus/cached_tasks',
  USER_RESPONSES: '@neighbors_plus/user_responses',
} as const;

export const API_DELAY = 800;
