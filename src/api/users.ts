import type { User } from '../types';
import { mockUsers, defaultUserProfile } from './mockData';
import { API_DELAY } from '../utils/constants';
import { getKarmaLevel } from '../utils/helpers';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let currentUserProfile: User = { ...defaultUserProfile };

export async function getUserById(id: string): Promise<User | null> {
  await delay(API_DELAY);

  return mockUsers.find((u) => u.id === id) ?? null;
}

export async function getCurrentUserProfile(): Promise<User> {
  await delay(API_DELAY);
  return { ...currentUserProfile };
}

export async function updateUserProfile(
  updates: Partial<Omit<User, 'id' | 'level'>>
): Promise<User> {
  await delay(API_DELAY);

  currentUserProfile = {
    ...currentUserProfile,
    ...updates,
    level: getKarmaLevel(updates.karma ?? currentUserProfile.karma),
  };

  return { ...currentUserProfile };
}

export function resetUserProfile(): void {
  currentUserProfile = { ...defaultUserProfile };
}
