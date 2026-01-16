# Лабораторная работа №2: Управление ресурсами и хуки

## Цель работы
Научиться эффективно управлять ресурсами мобильного приложения и использовать хуки для управления состоянием и жизненным циклом компонентов.

## Задачи
1. Реализовать управление ресурсами приложения (API, локальное хранилище)
2. Применить React хуки для управления состоянием и жизненным циклом

## Используемые хуки

### 1. useState - управление локальным состоянием

```tsx
// Пример из TaskListScreen.tsx
// useState хранит выбранную категорию для фильтрации
const [selectedCategory, setSelectedCategory] = useState<TaskCategory | null>(null);

// Пример из CreateTaskScreen.tsx
// Состояние формы создания задачи
const [title, setTitle] = useState('');
const [description, setDescription] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false);
```

**Принцип работы:**
- `useState` возвращает массив: [текущее значение, функция обновления]
- При вызове setter компонент перерендеривается с новым значением
- Начальное значение устанавливается один раз при монтировании

### 2. useEffect - побочные эффекты и жизненный цикл

```tsx
// Пример из useTasks.ts
// Загрузка данных при монтировании компонента
useEffect(() => {
  let isMounted = true; // Флаг для предотвращения утечек памяти

  const load = async () => {
    try {
      setLoading(true);
      const data = await getTasks();
      if (isMounted) {
        setTasks(data); // Обновляем только если компонент смонтирован
      }
    } catch (e) {
      if (isMounted) {
        setError(e instanceof Error ? e : new Error('Ошибка'));
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  };

  load();

  // Cleanup функция - вызывается при размонтировании
  return () => {
    isMounted = false;
  };
}, []); // Пустой массив = выполнить один раз при монтировании
```

**Ключевые моменты:**
- `useEffect` выполняется после рендера компонента
- Cleanup функция предотвращает утечки памяти
- Массив зависимостей контролирует когда эффект перезапускается

### 3. useCallback - мемоизация функций

```tsx
// Пример из useTasks.ts
// Функция refetch мемоизирована и не пересоздается при каждом рендере
const fetchTasks = useCallback(async () => {
  try {
    setLoading(true);
    setError(null);
    const data = await getTasks();
    setTasks(data);
  } catch (e) {
    setError(e instanceof Error ? e : new Error('Ошибка'));
  } finally {
    setLoading(false);
  }
}, []); // Зависимости пустые - функция создается один раз
```

**Зачем нужен:**
- Предотвращает лишние перерендеры дочерних компонентов
- Сохраняет ссылку на функцию между рендерами
- Важен для оптимизации производительности

### 4. useMemo - мемоизация вычислений

```tsx
// Пример из TaskListScreen.tsx
// Фильтрация пересчитывается только при изменении tasks или selectedCategory
const filteredTasks = useMemo(() => {
  if (!selectedCategory) return tasks;
  return tasks.filter((task) => task.category === selectedCategory);
}, [tasks, selectedCategory]);
```

**Когда использовать:**
- Дорогие вычисления (фильтрация, сортировка больших массивов)
- Создание объектов, передаваемых в дочерние компоненты
- Оптимизация рендеринга

### 5. useRef - доступ к DOM/нативным элементам

```tsx
// Пример из VideoPlayer.tsx
// Ссылка на Video компонент для управления воспроизведением
const videoRef = useRef<Video>(null);

const togglePlayback = async () => {
  if (!videoRef.current) return;

  if (isPlaying) {
    await videoRef.current.pauseAsync(); // Прямой вызов метода
  } else {
    await videoRef.current.playAsync();
  }
};

return <Video ref={videoRef} source={{ uri }} />;
```

## Кастомные хуки

### 1. useAsyncStorage - работа с локальным хранилищем

```tsx
// src/hooks/useAsyncStorage.ts
// Универсальный хук для работы с AsyncStorage
export function useAsyncStorage<T>(key: string, initialValue: T | null = null) {
  const [value, setValueState] = useState<T | null>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Загрузка данных при монтировании
  useEffect(() => {
    let isMounted = true;
    const loadValue = async () => {
      try {
        const storedValue = await AsyncStorage.getItem(key);
        if (isMounted && storedValue !== null) {
          setValueState(JSON.parse(storedValue));
        }
      } catch (e) {
        if (isMounted) setError(e as Error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadValue();
    return () => { isMounted = false; };
  }, [key]);

  // Функция сохранения
  const setValue = useCallback(async (newValue: T) => {
    await AsyncStorage.setItem(key, JSON.stringify(newValue));
    setValueState(newValue);
  }, [key]);

  // Функция удаления
  const removeValue = useCallback(async () => {
    await AsyncStorage.removeItem(key);
    setValueState(null);
  }, [key]);

  return { value, loading, error, setValue, removeValue };
}
```

**Использование:**
```tsx
// В компоненте ProfileScreen
const { value: profile, setValue: setProfile, loading } = useAsyncStorage<UserProfile>(
  '@neighbors_plus/user_profile',
  defaultProfile
);
```

### 2. useTasks - загрузка задач

```tsx
// src/hooks/useTasks.ts
// Хук для работы со списком задач
export function useTasks(): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Автозагрузка при монтировании
  useEffect(() => { /* загрузка */ }, []);

  // Функция для ручного обновления
  const refetch = useCallback(async () => { /* перезагрузка */ }, []);

  return { tasks, loading, error, refetch };
}
```

### 3. useUserProfile - профиль пользователя

```tsx
// src/hooks/useUserProfile.ts
// Хук управления профилем с системой кармы
export function useUserProfile() {
  const { value: profile, setValue: setProfile, loading } = useAsyncStorage<UserProfile>(
    STORAGE_KEYS.USER_PROFILE,
    defaultUserProfile
  );

  // Функция изменения кармы
  const updateKarma = useCallback(async (delta: number) => {
    if (profile) {
      const newKarma = Math.max(0, profile.karma + delta);
      const newLevel = getKarmaLevel(newKarma);
      await setProfile({ ...profile, karma: newKarma, level: newLevel });
    }
  }, [profile, setProfile]);

  return { profile, loading, updateProfile: setProfile, updateKarma };
}
```

## Управление ресурсами

### API Layer (Mock API)

```tsx
// src/api/tasks.ts
const API_DELAY = 800; // Эмуляция сетевой задержки

// Получение всех задач
export async function getTasks(): Promise<Task[]> {
  await delay(API_DELAY);
  return [...mockTasks];
}

// Получение задачи по ID
export async function getTaskById(id: string): Promise<Task> {
  await delay(API_DELAY);
  const task = mockTasks.find(t => t.id === id);
  if (!task) throw new Error('Задача не найдена');
  return task;
}

// Создание новой задачи
export async function createTask(data: CreateTaskData): Promise<Task> {
  await delay(API_DELAY);
  const newTask: Task = {
    id: generateId(),
    ...data,
    status: 'open',
    createdAt: new Date().toISOString(),
    authorId: 'current-user',
  };
  mockTasks.push(newTask);
  return newTask;
}
```

### Локальное хранилище (AsyncStorage)

```tsx
// Ключи для хранения данных
export const STORAGE_KEYS = {
  USER_PROFILE: '@neighbors_plus/user_profile',
  CACHED_TASKS: '@neighbors_plus/cached_tasks',
  USER_RESPONSES: '@neighbors_plus/user_responses',
};

// Пример использования
await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
const profile = data ? JSON.parse(data) : null;
```

## Жизненный цикл компонента

```
Монтирование:
1. Вызов функции компонента
2. Выполнение useState (установка начальных значений)
3. Первый рендер
4. Выполнение useEffect (загрузка данных)

Обновление:
1. Изменение props или state
2. Перевызов функции компонента
3. Перерендер
4. Выполнение useEffect (если зависимости изменились)

Размонтирование:
1. Вызов cleanup функций из useEffect
2. Очистка ресурсов
```

## Паттерны обработки ошибок

```tsx
// Паттерн Loading/Error/Success
function TaskListScreen() {
  const { tasks, loading, error, refetch } = useTasks();

  // Состояние загрузки
  if (loading) {
    return <LoadingState message="Загружаем задачи..." />;
  }

  // Состояние ошибки с возможностью повтора
  if (error) {
    return <ErrorState message={error.message} onRetry={refetch} />;
  }

  // Пустое состояние
  if (tasks.length === 0) {
    return <EmptyState title="Нет задач" />;
  }

  // Успешное состояние
  return <FlatList data={tasks} ... />;
}
```

## Вопросы для защиты

1. **Чем useState отличается от переменной?**
   - useState сохраняет значение между рендерами
   - При изменении state компонент перерендеривается
   - Обычная переменная сбрасывается при каждом рендере

2. **Зачем нужен cleanup в useEffect?**
   - Предотвращает утечки памяти
   - Отменяет подписки и таймеры
   - Предотвращает обновление размонтированного компонента

3. **Когда использовать useCallback vs useMemo?**
   - useCallback - для мемоизации функций
   - useMemo - для мемоизации значений/вычислений
   - Оба предотвращают лишние перерендеры

4. **Что такое AsyncStorage?**
   - Асинхронное key-value хранилище
   - Аналог localStorage для React Native
   - Данные сохраняются между запусками приложения

5. **Почему важен isMounted паттерн?**
   - Предотвращает ошибку "Can't perform state update on unmounted component"
   - Защищает от race condition при быстром размонтировании

## Ссылки
- [React Hooks Documentation](https://react.dev/reference/react)
- [AsyncStorage Documentation](https://react-native-async-storage.github.io/async-storage/)
- [Custom Hooks Guide](https://react.dev/learn/reusing-logic-with-custom-hooks)
