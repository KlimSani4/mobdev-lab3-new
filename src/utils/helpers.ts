import type { KarmaLevel } from '../types';
import { KARMA_THRESHOLDS } from './constants';

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
