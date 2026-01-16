import type { TaskCategory, TaskStatus, TaskUrgency } from '../types';

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  repair: 'Ремонт',
  delivery: 'Доставка',
  pets: 'Питомцы',
  other: 'Другое',
};

export const CATEGORY_ICONS: Record<TaskCategory, string> = {
  repair: '🔧',
  delivery: '📦',
  pets: '🐾',
  other: '📋',
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  open: 'Открыта',
  in_progress: 'В работе',
  completed: 'Выполнена',
};

export const STATUS_COLORS: Record<TaskStatus, string> = {
  open: '#4CAF50',
  in_progress: '#FF9800',
  completed: '#9E9E9E',
};

// Метки срочности
export const URGENCY_LABELS: Record<TaskUrgency, string> = {
  low: 'Не срочно',
  medium: 'Обычная',
  high: 'Важно',
  urgent: 'Срочно!',
};

// Цвета срочности
export const URGENCY_COLORS: Record<TaskUrgency, string> = {
  low: '#9E9E9E',      // Серый
  medium: '#2196F3',   // Синий
  high: '#FF9800',     // Оранжевый
  urgent: '#F44336',   // Красный
};

// Порядок сортировки срочности (больше = срочнее)
export const URGENCY_ORDER: Record<TaskUrgency, number> = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4,
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
