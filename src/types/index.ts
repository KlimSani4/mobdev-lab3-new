export type TaskCategory = 'delivery' | 'tools' | 'pets' | 'other';

export type TaskStatus = 'open' | 'in_progress' | 'closed';

export type ResponseStatus = 'pending' | 'accepted' | 'rejected';

export type KarmaLevel = 'Новичок' | 'Сосед' | 'Добряк' | 'Легенда подъезда';

export interface User {
  id: string;
  name: string;
  phone: string;
  avatar_url: string | null;
  karma: number;
  level: KarmaLevel;
}

export interface Task {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  category: TaskCategory;
  status: TaskStatus;
  created_at: string;
  image_url?: string;
  video_url?: string;
}

export interface TaskResponse {
  id: string;
  task_id: string;
  user_id: string;
  status: ResponseStatus;
  created_at: string;
}

export type RootStackParamList = {
  MainTabs: undefined;
  TaskDetail: { taskId: string };
  CreateTask: undefined;
};

export type MainTabParamList = {
  TaskList: undefined;
  CreateTask: undefined;
  Profile: undefined;
};
