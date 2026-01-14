import type { Task, TaskCategory } from '../types';
import { mockTasks, mockUsers } from './mockData';
import { API_DELAY } from '../utils/constants';
import { generateId } from '../utils/helpers';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getTasks(): Promise<Task[]> {
  await delay(API_DELAY);

  const sortedTasks = [...mockTasks].sort((a, b) => {
    if (a.status === 'open' && b.status !== 'open') return -1;
    if (a.status !== 'open' && b.status === 'open') return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return sortedTasks;
}

export async function getTaskById(id: string): Promise<Task> {
  await delay(API_DELAY);

  const task = mockTasks.find((t) => t.id === id);
  if (!task) {
    throw new Error(`Задача с ID ${id} не найдена`);
  }

  return task;
}

export async function getTaskCreatorName(creatorId: string): Promise<string> {
  await delay(200);

  const user = mockUsers.find((u) => u.id === creatorId);
  return user?.name ?? 'Неизвестный сосед';
}

export async function createTask(
  data: Omit<Task, 'id' | 'creator_id' | 'created_at' | 'status'>
): Promise<Task> {
  await delay(API_DELAY);

  const newTask: Task = {
    ...data,
    id: generateId(),
    creator_id: 'user-1',
    status: 'open',
    created_at: new Date().toISOString(),
  };

  mockTasks.unshift(newTask);
  return newTask;
}

export async function getTasksByCategory(
  category: TaskCategory
): Promise<Task[]> {
  await delay(API_DELAY);

  return mockTasks.filter((t) => t.category === category);
}
