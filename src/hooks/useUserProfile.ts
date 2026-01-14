import { useCallback } from 'react';
import type { User } from '../types';
import { useAsyncStorage } from './useAsyncStorage';
import { STORAGE_KEYS } from '../utils/constants';
import { defaultUserProfile } from '../api';
import { getKarmaLevel } from '../utils/helpers';

interface UseUserProfileResult {
  profile: User;
  loading: boolean;
  error: Error | null;
  updateProfile: (updates: Partial<Omit<User, 'id' | 'level'>>) => Promise<void>;
  resetProfile: () => Promise<void>;
}

export function useUserProfile(): UseUserProfileResult {
  const { value, loading, error, setValue, removeValue } = useAsyncStorage<User>(
    STORAGE_KEYS.USER_PROFILE,
    defaultUserProfile
  );

  const profile = value ?? defaultUserProfile;

  const updateProfile = useCallback(
    async (updates: Partial<Omit<User, 'id' | 'level'>>) => {
      const newKarma = updates.karma ?? profile.karma;
      const updatedProfile: User = {
        ...profile,
        ...updates,
        level: getKarmaLevel(newKarma),
      };
      await setValue(updatedProfile);
    },
    [profile, setValue]
  );

  const resetProfile = useCallback(async () => {
    await removeValue();
  }, [removeValue]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    resetProfile,
  };
}
