# Лабораторная работа №1: Основной макет мобильного приложения

## Цель работы
Создать основной макет мобильного приложения с использованием ключевых компонентов React Native.

## Задачи
1. Выбрать мобильную платформу и настроить среду разработки
2. Создать основной макет приложения с базовыми компонентами
3. Добавить комментарии к коду

## Выбор платформы и настройка среды

### Выбранная платформа
- **React Native** с **Expo SDK 54** - кросс-платформенный фреймворк для iOS, Android и Web
- **TypeScript** - для типизации и улучшения качества кода

### Почему Expo?
1. **Быстрый старт** - не требуется настройка нативных инструментов (Xcode, Android Studio)
2. **Hot Reload** - мгновенное отображение изменений
3. **Expo Go** - тестирование на реальных устройствах без сборки
4. **Кросс-платформенность** - один код для iOS, Android и Web

### Установка и запуск
```bash
# Клонирование репозитория
git clone https://github.com/KlimSani4/mobdev-lab3-new.git
cd mobdev-lab3-new

# Установка зависимостей
npm install

# Запуск в режиме разработки
npx expo start
```

## Структура проекта

```
mobdev-lab3-new/
├── App.tsx                 # Точка входа, настройка навигации
├── src/
│   ├── screens/           # Экраны приложения
│   │   ├── TaskListScreen.tsx    # Главный экран со списком задач
│   │   ├── TaskDetailScreen.tsx  # Детали задачи
│   │   ├── CreateTaskScreen.tsx  # Создание задачи
│   │   └── ProfileScreen.tsx     # Профиль пользователя
│   ├── components/        # Переиспользуемые компоненты
│   │   ├── TaskCard.tsx          # Карточка задачи
│   │   ├── CategoryFilter.tsx    # Фильтр категорий
│   │   ├── LoadingState.tsx      # Индикатор загрузки
│   │   ├── ErrorState.tsx        # Состояние ошибки
│   │   └── EmptyState.tsx        # Пустое состояние
│   ├── hooks/             # Кастомные хуки
│   ├── api/               # API функции
│   ├── types/             # TypeScript типы
│   └── utils/             # Вспомогательные функции
├── assets/                # Ресурсы (иконки, изображения)
└── package.json           # Зависимости проекта
```

## Основные компоненты

### 1. App.tsx - Точка входа приложения

```tsx
// Главный компонент приложения
// Настраивает навигацию и провайдеры
export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="light" />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
```

**Что делает:**
- `ErrorBoundary` - перехватывает ошибки рендеринга
- `SafeAreaProvider` - безопасные отступы для notch-устройств
- `NavigationContainer` - контейнер навигации
- `Stack.Navigator` - стек-навигация между экранами

### 2. TaskListScreen.tsx - Главный экран

```tsx
// Экран списка задач с фильтрацией по категориям
export function TaskListScreen({ navigation }: Props) {
  const { tasks, loading, error, refetch } = useTasks();
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | null>(null);

  // Мемоизированная фильтрация задач
  const filteredTasks = useMemo(() => {
    if (!selectedCategory) return tasks;
    return tasks.filter((task) => task.category === selectedCategory);
  }, [tasks, selectedCategory]);

  return (
    <SafeAreaView style={styles.container}>
      <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
      <FlatList
        data={filteredTasks}
        renderItem={({ item }) => <TaskCard task={item} />}
        refreshControl={<RefreshControl onRefresh={handleRefresh} />}
      />
    </SafeAreaView>
  );
}
```

**Ключевые компоненты:**
- `FlatList` - оптимизированный список для больших данных
- `RefreshControl` - pull-to-refresh функциональность
- `SafeAreaView` - безопасная область экрана

### 3. TaskCard.tsx - Карточка задачи

```tsx
// Карточка отображения задачи в списке
export function TaskCard({ task, onPress }: TaskCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.category}>{categoryIcon}</Text>
        <Text style={styles.title}>{task.title}</Text>
      </View>
      <Text style={styles.description}>{task.description}</Text>
      <View style={styles.footer}>
        <Text style={styles.date}>{formatDate(task.createdAt)}</Text>
        <View style={[styles.status, { backgroundColor: statusColor }]}>
          <Text>{task.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
```

## Используемые компоненты React Native

| Компонент | Назначение | Файл |
|-----------|-----------|------|
| `View` | Контейнер для layout | Все файлы |
| `Text` | Отображение текста | Все файлы |
| `TouchableOpacity` | Кнопка с прозрачностью | TaskCard, кнопки |
| `FlatList` | Оптимизированный список | TaskListScreen |
| `ScrollView` | Прокручиваемый контент | ProfileScreen, DetailScreen |
| `TextInput` | Поля ввода | CreateTaskScreen |
| `Image` | Отображение изображений | ProfileScreen |
| `ActivityIndicator` | Индикатор загрузки | LoadingState |
| `RefreshControl` | Pull-to-refresh | TaskListScreen |
| `StyleSheet` | Стилизация компонентов | Все файлы |

## Стилизация

### Подход к стилям
Используется `StyleSheet.create()` для оптимизации и типизации стилей:

```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    // Тень для iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Тень для Android
    elevation: 3,
  },
});
```

## Принятые решения

1. **Expo вместо React Native CLI** - упрощает разработку и деплой
2. **TypeScript** - строгая типизация предотвращает ошибки
3. **Bottom Tab Navigation** - интуитивная навигация для мобильных приложений
4. **Компонентный подход** - переиспользуемые UI-элементы
5. **Кастомные хуки** - инкапсуляция логики работы с данными

## Вопросы для защиты

1. **Что такое React Native и чем отличается от React?**
   - React Native компилируется в нативные компоненты (UIView, android.view)
   - Использует нативный рендеринг вместо WebView

2. **Зачем нужен Expo?**
   - Упрощает настройку среды разработки
   - Предоставляет готовые API (камера, геолокация, уведомления)
   - Позволяет тестировать через Expo Go без сборки

3. **Что такое SafeAreaView?**
   - Компонент для безопасного отображения контента
   - Учитывает notch, status bar, home indicator

4. **Почему FlatList, а не ScrollView?**
   - FlatList рендерит только видимые элементы (виртуализация)
   - Оптимально для больших списков (100+ элементов)

5. **Как работает StyleSheet.create()?**
   - Создает оптимизированный объект стилей
   - Валидирует стили на этапе разработки
   - Преобразует стили в нативный формат один раз

## Ссылки
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
