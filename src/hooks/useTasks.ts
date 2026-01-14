import { useState, useEffect, useCallback } from 'react';
import type { Task } from '../types';
import { getTasks } from '../api';

interface UseTasksResult {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useTasks(): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTasks();
      setTasks(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Не удалось загрузить задачи'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTasks();
        if (isMounted) {
          setTasks(data);
        }
      } catch (e) {
        if (isMounted) {
          setError(
            e instanceof Error ? e : new Error('Не удалось загрузить задачи')
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { tasks, loading, error, refetch: fetchTasks };
}
