import type { KarmaLevel, TaskUrgency, Task } from '../types';
import { KARMA_THRESHOLDS, URGENCY_COLORS, URGENCY_ORDER } from './constants';

export function getKarmaLevel(karma: number): KarmaLevel {
  if (karma >= KARMA_THRESHOLDS.LEGEND) return 'Легенда подъезда';
  if (karma >= KARMA_THRESHOLDS.HELPER) return 'Добряк';
  if (karma >= KARMA_THRESHOLDS.NEIGHBOR) return 'Сосед';
  return 'Новичок';
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return 'только что';
  if (diffHours < 24) return `${diffHours} ч. назад`;
  if (diffDays < 7) return `${diffDays} дн. назад`;

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length !== 11) return phone;

  return `+7 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

/**
 * Возвращает относительное время (например, "5 минут назад")
 * Более детальная версия formatDate с минутами
 */
export function timeAgo(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'только что';
  if (diffMinutes < 60) {
    const lastDigit = diffMinutes % 10;
    const lastTwoDigits = diffMinutes % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return `${diffMinutes} минут назад`;
    }
    if (lastDigit === 1) return `${diffMinutes} минуту назад`;
    if (lastDigit >= 2 && lastDigit <= 4) return `${diffMinutes} минуты назад`;
    return `${diffMinutes} минут назад`;
  }
  if (diffHours < 24) {
    const lastDigit = diffHours % 10;
    const lastTwoDigits = diffHours % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return `${diffHours} часов назад`;
    }
    if (lastDigit === 1) return `${diffHours} час назад`;
    if (lastDigit >= 2 && lastDigit <= 4) return `${diffHours} часа назад`;
    return `${diffHours} часов назад`;
  }
  if (diffDays < 7) {
    const lastDigit = diffDays % 10;
    const lastTwoDigits = diffDays % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return `${diffDays} дней назад`;
    }
    if (lastDigit === 1) return `${diffDays} день назад`;
    if (lastDigit >= 2 && lastDigit <= 4) return `${diffDays} дня назад`;
    return `${diffDays} дней назад`;
  }

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

/**
 * Возвращает цвет для уровня срочности
 */
export function getUrgencyColor(urgency: TaskUrgency | undefined): string {
  if (!urgency) return URGENCY_COLORS.medium;
  return URGENCY_COLORS[urgency];
}

/**
 * Сортировка задач по срочности (от срочных к обычным)
 */
export function sortByUrgency(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const urgencyA = URGENCY_ORDER[a.urgency || 'medium'];
    const urgencyB = URGENCY_ORDER[b.urgency || 'medium'];
    return urgencyB - urgencyA; // Срочные первые
  });
}

/**
 * Фильтрация задач по поисковому запросу
 */
export function filterTasksBySearch(tasks: Task[], query: string): Task[] {
  if (!query.trim()) return tasks;
  const lowerQuery = query.toLowerCase().trim();
  return tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(lowerQuery) ||
      task.description.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Подсчёт задач по категориям
 */
export function countTasksByCategory(tasks: Task[]): Record<string, number> {
  const counts: Record<string, number> = { all: tasks.length };
  for (const task of tasks) {
    counts[task.category] = (counts[task.category] || 0) + 1;
  }
  return counts;
}
