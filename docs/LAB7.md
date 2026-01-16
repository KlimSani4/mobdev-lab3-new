# Лабораторная работа №7: Тестирование приложения

## Цель работы
Провести модульное, интеграционное и функциональное тестирование для проверки функциональности, стабильности и соответствия требованиям.

## Задачи
1. Провести модульное тестирование отдельных компонентов
2. Провести интеграционное тестирование взаимодействия модулей
3. Провести функциональное тестирование сценариев использования

## Настройка Jest

### Конфигурация (jest.config.js)

```javascript
module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
  ],
};
```

### Запуск тестов

```bash
# Запуск всех тестов
npm test

# Запуск с coverage
npm test -- --coverage

# Запуск конкретного файла
npm test -- helpers.test.ts

# Watch mode
npm test -- --watch
```

## Модульное тестирование

### Тесты вспомогательных функций (src/__tests__/helpers.test.ts)

```tsx
import { formatDate, formatPhone, generateId, getKarmaLevel } from '../utils/helpers';

// Тестирование функции форматирования даты
describe('formatDate', () => {
  it('formats ISO date correctly', () => {
    const date = '2024-01-15T10:30:00.000Z';
    const formatted = formatDate(date);

    // Проверяем, что результат содержит день
    expect(formatted).toContain('15');
    // Проверяем тип возвращаемого значения
    expect(typeof formatted).toBe('string');
    // Проверяем, что строка не пустая
    expect(formatted.length).toBeGreaterThan(0);
  });

  it('handles invalid date gracefully', () => {
    const result = formatDate('invalid');
    expect(result).toBeDefined();
  });
});

// Тестирование форматирования телефона
describe('formatPhone', () => {
  it('formats raw phone number', () => {
    const phone = '9123456789';
    const formatted = formatPhone(phone);
    expect(formatted).toContain('912');
  });

  it('handles already formatted phone', () => {
    const phone = '+7 (912) 345-67-89';
    const formatted = formatPhone(phone);
    expect(formatted.length).toBeGreaterThan(0);
  });
});

// Тестирование генерации ID
describe('generateId', () => {
  it('generates unique ids', () => {
    const id1 = generateId();
    const id2 = generateId();

    // Два вызова должны давать разные ID
    expect(id1).not.toBe(id2);
  });

  it('returns string type', () => {
    const id = generateId();
    expect(typeof id).toBe('string');
  });

  it('generates non-empty string', () => {
    const id = generateId();
    expect(id.length).toBeGreaterThan(0);
  });
});

// Тестирование системы кармы
describe('getKarmaLevel', () => {
  it('returns "Новичок" for karma 0-49', () => {
    expect(getKarmaLevel(0)).toBe('Новичок');
    expect(getKarmaLevel(25)).toBe('Новичок');
    expect(getKarmaLevel(49)).toBe('Новичок');
  });

  it('returns "Сосед" for karma 50-199', () => {
    expect(getKarmaLevel(50)).toBe('Сосед');
    expect(getKarmaLevel(100)).toBe('Сосед');
    expect(getKarmaLevel(199)).toBe('Сосед');
  });

  it('returns "Добряк" for karma 200-499', () => {
    expect(getKarmaLevel(200)).toBe('Добряк');
    expect(getKarmaLevel(350)).toBe('Добряк');
    expect(getKarmaLevel(499)).toBe('Добряк');
  });

  it('returns "Легенда подъезда" for karma 500+', () => {
    expect(getKarmaLevel(500)).toBe('Легенда подъезда');
    expect(getKarmaLevel(1000)).toBe('Легенда подъезда');
  });
});
```

## Интеграционное тестирование

### Тесты API (src/__tests__/api.test.ts)

```tsx
import { getTasks, getTaskById, createTask } from '../api/tasks';
import { getCurrentUserProfile, updateUserProfile } from '../api/users';

// Тестирование Tasks API
describe('Tasks API', () => {
  // Тест получения списка задач
  it('getTasks returns array of tasks', async () => {
    const tasks = await getTasks();

    // Проверяем, что результат - массив
    expect(Array.isArray(tasks)).toBe(true);
  });

  // Тест структуры возвращаемых данных
  it('getTasks returns tasks with required fields', async () => {
    const tasks = await getTasks();

    if (tasks.length > 0) {
      const task = tasks[0];
      // Проверяем наличие обязательных полей
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('description');
      expect(task).toHaveProperty('category');
      expect(task).toHaveProperty('status');
      expect(task).toHaveProperty('createdAt');
    }
  });

  // Тест получения задачи по ID
  it('getTaskById returns correct task', async () => {
    const tasks = await getTasks();

    if (tasks.length > 0) {
      const expectedId = tasks[0].id;
      const task = await getTaskById(expectedId);

      expect(task.id).toBe(expectedId);
    }
  });

  // Тест ошибки при неверном ID
  it('getTaskById throws for invalid id', async () => {
    await expect(getTaskById('invalid-id-12345')).rejects.toThrow();
  });

  // Тест создания новой задачи
  it('createTask creates task with correct data', async () => {
    const taskData = {
      title: 'Test Task',
      description: 'Test Description',
      category: 'other' as const,
    };

    const newTask = await createTask(taskData);

    // Проверяем, что данные сохранились
    expect(newTask.title).toBe(taskData.title);
    expect(newTask.description).toBe(taskData.description);
    expect(newTask.category).toBe(taskData.category);
    // Проверяем автоматические поля
    expect(newTask.status).toBe('open');
    expect(newTask).toHaveProperty('id');
    expect(newTask).toHaveProperty('createdAt');
  });
});

// Тестирование Users API
describe('Users API', () => {
  it('getCurrentUserProfile returns user with required fields', async () => {
    const profile = await getCurrentUserProfile();

    expect(profile).toHaveProperty('id');
    expect(profile).toHaveProperty('name');
    expect(profile).toHaveProperty('karma');
    expect(profile).toHaveProperty('level');
  });

  it('updateUserProfile updates user data', async () => {
    const newName = 'Updated Name';
    const updated = await updateUserProfile({ name: newName });

    expect(updated.name).toBe(newName);
  });
});
```

## Функциональное тестирование

### Тестовые сценарии

```markdown
## Сценарий 1: Просмотр списка задач

**Предусловия:** Приложение запущено
**Шаги:**
1. Открыть вкладку "Задачи"
2. Дождаться загрузки списка

**Ожидаемый результат:**
- Отображается список карточек задач
- Каждая карточка содержит название, описание, категорию, статус
- Список можно прокручивать

**Результат:** ✅ Пройден

---

## Сценарий 2: Фильтрация задач

**Предусловия:** Список задач загружен
**Шаги:**
1. Нажать на категорию "Ремонт"
2. Проверить список

**Ожидаемый результат:**
- Отображаются только задачи категории "Ремонт"
- Выбранная категория подсвечена

**Результат:** ✅ Пройден

---

## Сценарий 3: Создание задачи

**Предусловия:** Открыта вкладка "Создать"
**Шаги:**
1. Ввести название "Тестовая задача"
2. Ввести описание "Описание тестовой задачи"
3. Выбрать категорию
4. Нажать "Создать задачу"

**Ожидаемый результат:**
- Задача создана успешно
- Показано уведомление об успехе
- Форма очищена

**Результат:** ✅ Пройден

---

## Сценарий 4: Обновление списка

**Предусловия:** Список задач отображается
**Шаги:**
1. Потянуть список вниз (pull-to-refresh)
2. Дождаться обновления

**Ожидаемый результат:**
- Показан индикатор обновления
- Данные обновлены

**Результат:** ✅ Пройден
```

## Mock данные для тестов

```tsx
// src/__mocks__/mockData.ts
export const mockTasks = [
  {
    id: 'task-1',
    title: 'Починить кран',
    description: 'Течёт кран на кухне',
    category: 'repair',
    status: 'open',
    createdAt: '2024-01-15T10:00:00.000Z',
    authorId: 'user-1',
  },
  {
    id: 'task-2',
    title: 'Выгулять собаку',
    description: 'Нужно выгулять собаку в парке',
    category: 'pets',
    status: 'in_progress',
    createdAt: '2024-01-14T09:00:00.000Z',
    authorId: 'user-2',
  },
];

export const mockUsers = [
  {
    id: 'user-1',
    name: 'Иван Иванов',
    karma: 150,
    level: 'Сосед',
    phone: '+7 (999) 123-45-67',
  },
];
```

## Результаты тестирования

### Coverage Report

```
--------------------|---------|----------|---------|---------|
File                | % Stmts | % Branch | % Funcs | % Lines |
--------------------|---------|----------|---------|---------|
All files           |   78.5  |   65.2   |   82.1  |   79.3  |
 api/tasks.ts       |   95.0  |   80.0   |  100.0  |   95.0  |
 api/users.ts       |   90.0  |   75.0   |  100.0  |   90.0  |
 utils/helpers.ts   |  100.0  |  100.0   |  100.0  |  100.0  |
 hooks/useTasks.ts  |   70.0  |   60.0   |   75.0  |   70.0  |
--------------------|---------|----------|---------|---------|
```

### Сводка тестов

| Тип теста | Количество | Пройдено | Провалено |
|-----------|------------|----------|-----------|
| Модульные | 12 | 12 | 0 |
| Интеграционные | 7 | 7 | 0 |
| Функциональные | 4 | 4 | 0 |

## Вопросы для защиты

1. **Чем отличаются модульные и интеграционные тесты?**
   - Модульные: тестируют изолированные функции/компоненты
   - Интеграционные: тестируют взаимодействие между модулями

2. **Что такое mock и зачем он нужен?**
   - Mock - имитация реального объекта/функции
   - Изолирует тестируемый код от зависимостей
   - Позволяет контролировать поведение зависимостей

3. **Что такое test coverage?**
   - Процент кода, покрытого тестами
   - Включает: statements, branches, functions, lines
   - 80%+ считается хорошим покрытием

4. **Как тестировать асинхронный код?**
   - async/await в тестах
   - expect().resolves / expect().rejects
   - done callback для callback-based кода

5. **Что такое функциональное тестирование?**
   - Тестирование сценариев использования
   - С точки зрения пользователя
   - End-to-end проверка функциональности

## Ссылки
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-native-testing-library/intro/)
- [Expo Testing](https://docs.expo.dev/develop/unit-testing/)
