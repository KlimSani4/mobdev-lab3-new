/**
 * types/index.ts - TypeScript типы для всего приложения
 *
 * Определяет структуры данных для задач, пользователей, навигации.
 */

// Категории задач
export type TaskCategory = 'repair' | 'delivery' | 'pets' | 'other';

// Статусы задач
export type TaskStatus = 'open' | 'in_progress' | 'completed';

// Уровни срочности задач
export type TaskUrgency = 'low' | 'medium' | 'high' | 'urgent';

// Статусы откликов
export type ResponseStatus = 'pending' | 'accepted' | 'rejected';

// Уровни кармы
export type KarmaLevel = 'Новичок' | 'Сосед' | 'Добряк' | 'Легенда подъезда';

// Пользователь
export interface User {
  id: string;
  name: string;
  phone: string;
  avatar?: string | null;
  avatar_url?: string | null;
  karma: number;
  level: KarmaLevel;
  createdAt?: string;
  _count?: {
    tasks: number;
    responses: number;
  };
}

// Задача
export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  status: TaskStatus;
  urgency?: TaskUrgency;
  reward?: number;
  imageUrl?: string;
  image_url?: string;
  video_url?: string;
  creator_id: string;
  created_at: string;
  author?: {
    id: string;
    name: string;
    avatar?: string;
    karma?: number;
    phone?: string;
  };
  responses?: TaskResponse[];
  _count?: {
    responses: number;
  };
  isBookmarked?: boolean;
}

// Отклик на задачу
export interface TaskResponse {
  id: string;
  taskId: string;
  task_id?: string;
  userId: string;
  user_id?: string;
  message?: string;
  status: ResponseStatus;
  createdAt: string;
  created_at?: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
    karma?: number;
  };
}

// Параметры для создания задачи (опционально предзаполненные)
export interface CreateTaskParams {
  /** Предзаполненная категория */
  initialCategory?: TaskCategory;
  /** Предзаполненный заголовок */
  initialTitle?: string;
}

// Параметры навигации для Stack Navigator
export type RootStackParamList = {
  Auth: undefined;
  MainTabs: undefined;
  TaskDetail: { taskId: string };
  CreateTask: CreateTaskParams | undefined;
  Chat: {
    chatId?: string;
    recipientId: string;
    recipientName: string;
    taskId?: string;
    taskTitle?: string;
  };
};

// Параметры навигации для Tab Navigator
export type MainTabParamList = {
  TaskList: undefined;
  Building: undefined;
  CreateTask: CreateTaskParams | undefined;
  ChatList: undefined;
  Profile: undefined;
};

// Параметры авторизации
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

// Типы объявлений
export type AnnouncementType = 'info' | 'warning' | 'alert';

// Объявление дома
export interface Announcement {
  id: string;
  title: string;
  message: string;
  type: AnnouncementType;
  date: string;
}
