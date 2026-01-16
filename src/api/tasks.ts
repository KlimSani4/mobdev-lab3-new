/**
 * tasks.ts - API функции для работы с задачами
 *
 * Использует HTTP клиент для запросов к бэкенду.
 * Все функции асинхронные и возвращают Promise.
 */

import { api, ApiError } from './client';
import type { Task, TaskCategory, TaskStatus, TaskUrgency } from '../types';

// Типы ответов от сервера
interface TasksResponse {
  tasks: Task[];
  total: number;
  limit: number;
  offset: number;
}

interface CreateTaskData {
  title: string;
  description: string;
  category: TaskCategory;
  urgency?: TaskUrgency;
  reward?: number;
  imageUrl?: string;
  authorId: string;
}

/**
 * Получить список всех задач
 * @param category - фильтр по категории (опционально)
 * @param status - фильтр по статусу (опционально)
 */
export async function getTasks(
  category?: TaskCategory,
  status?: TaskStatus
): Promise<Task[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category.toUpperCase());
  if (status) params.append('status', status.toUpperCase());

  const queryString = params.toString();
  const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';

  const response = await api.get<TasksResponse>(endpoint);
  return response.tasks.map(normalizeTask);
}

/**
 * Получить задачу по ID
 */
export async function getTaskById(id: string): Promise<Task> {
  const task = await api.get<Task>(`/tasks/${id}`);
  return normalizeTask(task);
}

/**
 * Создать новую задачу
 */
export async function createTask(data: CreateTaskData): Promise<Task> {
  const task = await api.post<Task>('/tasks', {
    ...data,
    category: data.category.toUpperCase(),
    urgency: data.urgency?.toUpperCase(),
  });
  return normalizeTask(task);
}

/**
 * Обновить задачу
 */
export async function updateTask(
  id: string,
  data: Partial<Pick<Task, 'title' | 'description' | 'status' | 'reward'>>
): Promise<Task> {
  const task = await api.patch<Task>(`/tasks/${id}`, {
    ...data,
    status: data.status?.toUpperCase(),
  });
  return normalizeTask(task);
}

/**
 * Удалить задачу
 */
export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

/**
 * Откликнуться на задачу
 */
export async function respondToTask(
  taskId: string,
  userId: string,
  message?: string
): Promise<void> {
  await api.post(`/tasks/${taskId}/respond`, { userId, message });
}

/**
 * Получить задачи по категории
 */
export async function getTasksByCategory(category: TaskCategory): Promise<Task[]> {
  return getTasks(category);
}

/**
 * Получить задачи созданные пользователем
 */
export async function getUserTasks(userId: string): Promise<Task[]> {
  const response = await api.get<TasksResponse>(`/tasks?authorId=${userId}`);
  return response.tasks.map(normalizeTask);
}

/**
 * Получить отклики пользователя (задачи на которые он откликнулся)
 */
export async function getUserResponses(userId: string): Promise<Task[]> {
  try {
    const response = await api.get<{ tasks: Task[] }>(`/users/${userId}/responses`);
    return response.tasks.map(normalizeTask);
  } catch {
    // Fallback: если API не поддерживает, возвращаем пустой массив
    return [];
  }
}

/**
 * Получить отклики на конкретную задачу
 */
export async function getTaskResponses(taskId: string): Promise<any[]> {
  try {
    const response = await api.get<{ responses: any[] }>(`/tasks/${taskId}/responses`);
    return response.responses || [];
  } catch {
    return [];
  }
}

/**
 * Нормализация данных задачи из API в формат фронтенда
 * Бэкенд использует UPPER_CASE для enum, фронтенд - lower_case
 */
function normalizeTask(task: any): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    category: task.category?.toLowerCase() as TaskCategory,
    status: task.status?.toLowerCase() as TaskStatus,
    urgency: task.urgency?.toLowerCase() as TaskUrgency | undefined,
    reward: task.reward,
    imageUrl: task.imageUrl,
    image_url: task.imageUrl || task.image_url,
    video_url: task.videoUrl || task.video_url,
    creator_id: task.authorId || task.author?.id || task.creator_id,
    created_at: task.createdAt || task.created_at,
    author: task.author,
    responses: task.responses,
    _count: task._count,
  };
}
