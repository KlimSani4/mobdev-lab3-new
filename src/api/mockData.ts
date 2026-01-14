import type { User, Task, TaskResponse } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Анна Петрова',
    phone: '+7-999-123-45-67',
    avatar_url: null,
    karma: 156,
    level: 'Сосед',
  },
  {
    id: '2',
    name: 'Иван Сидоров',
    phone: '+7-999-765-43-21',
    avatar_url: null,
    karma: 523,
    level: 'Легенда подъезда',
  },
  {
    id: '3',
    name: 'Мария Козлова',
    phone: '+7-916-555-12-34',
    avatar_url: null,
    karma: 42,
    level: 'Новичок',
  },
  {
    id: '4',
    name: 'Дмитрий Волков',
    phone: '+7-925-888-99-00',
    avatar_url: null,
    karma: 287,
    level: 'Добряк',
  },
];

export const mockTasks: Task[] = [
  {
    id: '1',
    creator_id: '1',
    title: 'Помочь донести продукты',
    description:
      'Заказ из Пятёрочки, 4 пакета, 3 этаж без лифта. Буду ждать у подъезда в 18:00.',
    category: 'delivery',
    status: 'open',
    created_at: '2025-01-10T10:00:00Z',
  },
  {
    id: '2',
    creator_id: '2',
    title: 'Одолжить перфоратор',
    description:
      'На 2 часа, повесить полку. Верну в тот же день, есть залог если нужно.',
    category: 'tools',
    status: 'open',
    created_at: '2025-01-10T14:30:00Z',
  },
  {
    id: '3',
    creator_id: '1',
    title: 'Присмотреть за котом',
    description:
      'Уезжаю на выходные, нужно кормить 2 раза в день. Кот спокойный, миски и корм оставлю.',
    category: 'pets',
    status: 'in_progress',
    created_at: '2025-01-09T09:00:00Z',
  },
  {
    id: '4',
    creator_id: '3',
    title: 'Помочь с переездом',
    description:
      'Нужна помощь перенести диван с 1 на 5 этаж. Лифт работает. Угощу пиццей!',
    category: 'delivery',
    status: 'open',
    created_at: '2025-01-11T08:15:00Z',
  },
  {
    id: '5',
    creator_id: '4',
    title: 'Выгулять собаку',
    description:
      'Задержусь на работе, нужно вывести лабрадора на 30 минут. Собака дружелюбная.',
    category: 'pets',
    status: 'closed',
    created_at: '2025-01-08T16:00:00Z',
  },
  {
    id: '6',
    creator_id: '2',
    title: 'Одолжить стремянку',
    description: 'На вечер, поменять лампочку в коридоре. Верну до 22:00.',
    category: 'tools',
    status: 'open',
    created_at: '2025-01-11T11:00:00Z',
  },
];

export const mockResponses: TaskResponse[] = [
  {
    id: '1',
    task_id: '3',
    user_id: '4',
    status: 'accepted',
    created_at: '2025-01-09T10:30:00Z',
  },
  {
    id: '2',
    task_id: '5',
    user_id: '1',
    status: 'accepted',
    created_at: '2025-01-08T16:30:00Z',
  },
];

export const defaultUserProfile: User = {
  id: 'current',
  name: 'Новый сосед',
  phone: '+7-900-000-00-00',
  avatar_url: null,
  karma: 0,
  level: 'Новичок',
};
