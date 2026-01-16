/**
 * useTasks - кастомный хук для работы со списком задач
 *
 * Демонстрирует использование:
 * - useState для управления состоянием (tasks, loading, error)
 * - useEffect для загрузки данных при монтировании
 * - useCallback для мемоизации функции refetch
 * - Паттерн isMounted для предотвращения утечек памяти
 *
 * @returns {UseTasksResult} Объект с задачами, состоянием загрузки и функцией обновления
 */
import { useState, useEffect, useCallback } from 'react';
import type { Task } from '../types';
import { getTasks } from '../api';

// Интерфейс возвращаемого значения хука
interface UseTasksResult {
  tasks: Task[];      // Массив задач
  loading: boolean;   // Флаг загрузки
  error: Error | null; // Ошибка, если произошла
  refetch: () => Promise<void>; // Функция для повторной загрузки
}

export function useTasks(): UseTasksResult {
  // Состояние для хранения списка задач
  const [tasks, setTasks] = useState<Task[]>([]);
  // Состояние загрузки - true пока данные загружаются
  const [loading, setLoading] = useState(true);
  // Состояние ошибки - null если всё ок
  const [error, setError] = useState<Error | null>(null);

  /**
   * fetchTasks - функция для загрузки/обновления задач
   * Обёрнута в useCallback для стабильной ссылки между рендерами
   * Используется для pull-to-refresh и ручного обновления
   */
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null); // Сбрасываем предыдущую ошибку
      const data = await getTasks();
      setTasks(data);
    } catch (e) {
      // Приводим ошибку к типу Error для единообразия
      setError(e instanceof Error ? e : new Error('Не удалось загрузить задачи'));
    } finally {
      // finally выполнится в любом случае
      setLoading(false);
    }
  }, []);

  /**
   * useEffect для начальной загрузки данных
   * Пустой массив зависимостей [] означает выполнение только при монтировании
   */
  useEffect(() => {
    // Флаг для отслеживания, смонтирован ли компонент
    // Предотвращает "memory leak" предупреждение
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getTasks();
        // Проверяем isMounted перед обновлением состояния
        // Если компонент размонтирован - не обновляем
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

    // Cleanup функция - вызывается при размонтировании компонента
    // Устанавливает флаг isMounted в false
    return () => {
      isMounted = false;
    };
  }, []);

  return { tasks, loading, error, refetch: fetchTasks };
}
