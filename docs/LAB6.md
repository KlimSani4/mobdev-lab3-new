# Лабораторная работа №6: Отладка приложения

## Цель работы
Провести отладку мобильного приложения для выявления и исправления ошибок, повышения стабильности и корректной работы.

## Задачи
1. Выявить потенциальные ошибки и неполадки
2. Исправить обнаруженные проблемы

## Инструменты отладки

### 1. React Native Debugger

```bash
# Открытие отладчика в Expo
npx expo start
# Нажать 'j' для открытия debugger
# Или 'm' для меню разработчика
```

### 2. Console.log и Logger

```tsx
// src/utils/logger.ts
// Централизованный логгер для отладки
const isDev = __DEV__;

export const logger = {
  info: (message: string, data?: any) => {
    if (isDev) {
      console.log(`ℹ️ [INFO] ${message}`, data ?? '');
    }
  },
  warn: (message: string, data?: any) => {
    if (isDev) {
      console.warn(`⚠️ [WARN] ${message}`, data ?? '');
    }
  },
  error: (message: string, error?: Error) => {
    if (isDev) {
      console.error(`❌ [ERROR] ${message}`, error?.message ?? '');
    }
    // В продакшене можно отправлять в Sentry/Crashlytics
  },
  debug: (message: string, data?: any) => {
    if (isDev) {
      console.log(`🐛 [DEBUG] ${message}`, data ?? '');
    }
  },
};
```

### 3. React DevTools

```bash
# Установка React DevTools
npm install -g react-devtools

# Запуск
react-devtools
```

## Выявленные проблемы и исправления

### Проблема 1: Утечка памяти в useEffect

**Симптом:** Warning "Can't perform a React state update on an unmounted component"

**Причина:** Асинхронная операция завершается после размонтирования компонента

**Было (с ошибкой):**
```tsx
// ❌ Проблемный код
useEffect(() => {
  const fetchData = async () => {
    const data = await getTasks();
    setTasks(data); // Может вызваться после unmount!
  };
  fetchData();
}, []);
```

**Стало (исправлено):**
```tsx
// ✓ Исправленный код с cleanup
useEffect(() => {
  let isMounted = true; // Флаг монтирования

  const fetchData = async () => {
    try {
      const data = await getTasks();
      // Проверяем, что компонент всё ещё смонтирован
      if (isMounted) {
        setTasks(data);
      }
    } catch (error) {
      if (isMounted) {
        setError(error);
      }
    }
  };

  fetchData();

  // Cleanup функция - вызывается при размонтировании
  return () => {
    isMounted = false;
  };
}, []);
```

**Объяснение:** Флаг `isMounted` предотвращает обновление состояния после размонтирования компонента.

---

### Проблема 2: Некорректная обработка ошибок

**Симптом:** Приложение крашится при сетевой ошибке

**Причина:** Отсутствие try-catch и ErrorBoundary

**Было:**
```tsx
// ❌ Без обработки ошибок
const data = await fetch(url);
const json = await data.json();
setData(json);
```

**Стало:**
```tsx
// ✓ С обработкой ошибок
try {
  setLoading(true);
  setError(null);
  const data = await fetch(url);

  if (!data.ok) {
    throw new Error(`HTTP error! status: ${data.status}`);
  }

  const json = await data.json();
  setData(json);
} catch (e) {
  const error = e instanceof Error ? e : new Error('Неизвестная ошибка');
  setError(error);
  logger.error('Ошибка загрузки данных', error);
} finally {
  setLoading(false);
}
```

---

### Проблема 3: ErrorBoundary для перехвата ошибок рендеринга

**Было:** Ошибка в одном компоненте крашит всё приложение

**Стало:** ErrorBoundary перехватывает ошибки

```tsx
// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // Вызывается при ошибке в дочернем компоненте
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // Логирование ошибки
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('ErrorBoundary caught error', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  // Сброс состояния ошибки
  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.icon}>💥</Text>
          <Text style={styles.title}>Что-то пошло не так</Text>
          <Text style={styles.message}>
            {this.state.error?.message || 'Неизвестная ошибка'}
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Попробовать снова</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
```

---

### Проблема 4: Race condition при быстрой навигации

**Симптом:** Отображаются данные от предыдущего запроса

**Причина:** Новый запрос начинается до завершения предыдущего

**Решение с AbortController:**
```tsx
useEffect(() => {
  const abortController = new AbortController();

  const fetchTask = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        signal: abortController.signal, // Привязываем к контроллеру
      });
      const data = await response.json();
      setTask(data);
    } catch (e) {
      if (e.name !== 'AbortError') {
        setError(e);
      }
      // AbortError игнорируем - это ожидаемое поведение
    }
  };

  fetchTask();

  // Отменяем запрос при размонтировании или изменении taskId
  return () => {
    abortController.abort();
  };
}, [taskId]);
```

---

### Проблема 5: Неоптимальный рендеринг списка

**Симптом:** Тормоза при скролле длинного списка

**Решение:**
```tsx
// ✓ Оптимизированный FlatList
<FlatList
  data={tasks}
  keyExtractor={(item) => item.id} // Уникальный ключ
  renderItem={renderItem}
  // Оптимизации производительности
  removeClippedSubviews={true}  // Удаляет невидимые элементы
  maxToRenderPerBatch={10}       // Максимум элементов за батч
  windowSize={5}                 // Количество "окон" для рендера
  initialNumToRender={10}        // Начальное количество
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>

// Мемоизация элемента списка
const renderItem = useCallback(({ item }) => (
  <TaskCard task={item} onPress={() => handlePress(item.id)} />
), [handlePress]);
```

## Паттерны отладки

### Console методы

```tsx
// Группировка логов
console.group('API Request');
console.log('URL:', url);
console.log('Params:', params);
console.groupEnd();

// Таблица данных
console.table(tasks);

// Время выполнения
console.time('fetchTasks');
await fetchTasks();
console.timeEnd('fetchTasks'); // fetchTasks: 234ms

// Stack trace
console.trace('Вызов функции');
```

### Проверка типов в runtime

```tsx
// Валидация данных от API
function validateTask(data: unknown): data is Task {
  if (typeof data !== 'object' || data === null) {
    logger.error('Invalid task data: not an object');
    return false;
  }

  const task = data as Record<string, unknown>;

  if (typeof task.id !== 'string') {
    logger.error('Invalid task.id');
    return false;
  }

  if (typeof task.title !== 'string') {
    logger.error('Invalid task.title');
    return false;
  }

  return true;
}
```

## Процесс отладки

```
1. Воспроизведение ошибки
   ↓
2. Изоляция проблемы (console.log, breakpoints)
   ↓
3. Анализ причины
   ↓
4. Формулирование гипотезы
   ↓
5. Реализация исправления
   ↓
6. Тестирование исправления
   ↓
7. Проверка на отсутствие регрессий
```

## Вопросы для защиты

1. **Что такое ErrorBoundary?**
   - Class component для перехвата ошибок рендеринга
   - Предотвращает краш всего приложения
   - Позволяет показать fallback UI

2. **Почему важен cleanup в useEffect?**
   - Предотвращает утечки памяти
   - Отменяет незавершённые запросы
   - Очищает подписки и таймеры

3. **Что такое race condition и как её избежать?**
   - Состояние гонки - когда порядок операций непредсказуем
   - Решение: AbortController, isMounted флаг, debounce

4. **Как оптимизировать FlatList?**
   - keyExtractor для стабильных ключей
   - getItemLayout для фиксированной высоты
   - removeClippedSubviews, windowSize настройки

5. **Какие инструменты отладки есть в React Native?**
   - Chrome DevTools (через debugger)
   - React DevTools (компоненты и props)
   - Flipper (сети, логи, layout)
   - Console методы (log, table, time)

## Ссылки
- [Debugging React Native](https://reactnative.dev/docs/debugging)
- [Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Performance Optimization](https://reactnative.dev/docs/performance)
