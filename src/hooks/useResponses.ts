import { useCallback } from 'react';
import { useAsyncStorage } from './useAsyncStorage';
import { STORAGE_KEYS } from '../utils/constants';

type ResponsesMap = Record<string, boolean>;

interface UseResponsesResult {
  hasResponded: (taskId: string) => boolean;
  respond: (taskId: string) => Promise<void>;
  loading: boolean;
}

export function useResponses(): UseResponsesResult {
  const { value, loading, setValue } = useAsyncStorage<ResponsesMap>(
    STORAGE_KEYS.USER_RESPONSES,
    {}
  );

  const responses = value ?? {};

  const hasResponded = useCallback(
    (taskId: string): boolean => {
      return responses[taskId] === true;
    },
    [responses]
  );

  const respond = useCallback(
    async (taskId: string) => {
      const updated = { ...responses, [taskId]: true };
      await setValue(updated);
    },
    [responses, setValue]
  );

  return { hasResponded, respond, loading };
}
