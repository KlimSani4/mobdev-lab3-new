# Лабораторная работа №4: Улучшение UI/UX

## Цель работы
Освоить методы улучшения пользовательского интерфейса через применение дизайна, стилей и добавление функциональных возможностей.

## Задачи
1. Создать единообразный и привлекательный дизайн интерфейса
2. Реализовать новые функциональные возможности для улучшения UX

## Дизайн-система

### Цветовая палитра (src/utils/theme.ts)

```tsx
export const theme = {
  colors: {
    // Основные цвета (Material Design)
    primary: '#6200EE',      // Фиолетовый - основной акцент
    primaryDark: '#3700B3',  // Темный вариант
    secondary: '#03DAC6',    // Бирюзовый - вторичный акцент

    // Семантические цвета
    error: '#F44336',        // Красный - ошибки
    success: '#4CAF50',      // Зеленый - успех
    warning: '#FF9800',      // Оранжевый - предупреждения

    // Нейтральные цвета
    background: '#F5F5F5',   // Фон приложения
    surface: '#FFFFFF',      // Карточки, модалки
    text: '#212121',         // Основной текст
    textSecondary: '#757575', // Вторичный текст
    border: '#E0E0E0',       // Границы
  },
};
```

### Система отступов

```tsx
export const theme = {
  spacing: {
    xs: 4,    // Минимальный отступ
    sm: 8,    // Маленький
    md: 12,   // Средний
    lg: 16,   // Большой
    xl: 20,   // Очень большой
    xxl: 24,  // Огромный
    xxxl: 32, // Максимальный
  },
};

// Использование
const styles = StyleSheet.create({
  card: {
    padding: theme.spacing.lg,      // 16px
    marginBottom: theme.spacing.md, // 12px
  },
});
```

### Типографика

```tsx
export const theme = {
  typography: {
    h1: { fontSize: 28, fontWeight: '700', lineHeight: 34 },
    h2: { fontSize: 24, fontWeight: '600', lineHeight: 30 },
    h3: { fontSize: 20, fontWeight: '600', lineHeight: 26 },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 22 },
    bodySmall: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
    caption: { fontSize: 12, fontWeight: '400', lineHeight: 16 },
    button: { fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
  },
};
```

### Скругления

```tsx
export const theme = {
  borderRadius: {
    sm: 4,      // Кнопки, чипы
    md: 8,      // Инпуты
    lg: 12,     // Карточки
    xl: 16,     // Модалки
    full: 9999, // Круглые элементы
  },
};
```

### Тени (кроссплатформенные)

```tsx
export const theme = {
  shadows: {
    small: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
    medium: Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
};
```

## Компоненты UI

### 1. TaskCard - Карточка задачи

```tsx
// src/components/TaskCard.tsx
export function TaskCard({ task, onPress }: TaskCardProps) {
  // Иконки категорий для визуального различия
  const categoryIcons: Record<TaskCategory, string> = {
    repair: '🔧',
    delivery: '📦',
    pets: '🐾',
    other: '📋',
  };

  // Цвета статусов для быстрой идентификации
  const statusColors: Record<TaskStatus, string> = {
    open: '#4CAF50',      // Зеленый - доступно
    in_progress: '#FF9800', // Оранжевый - в работе
    completed: '#9E9E9E',  // Серый - завершено
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7} // Визуальный отклик на нажатие
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{categoryIcons[task.category]}</Text>
        <Text style={styles.title} numberOfLines={2}>{task.title}</Text>
      </View>

      <Text style={styles.description} numberOfLines={3}>
        {task.description}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.date}>{formatDate(task.createdAt)}</Text>
        <View style={[styles.status, { backgroundColor: statusColors[task.status] }]}>
          <Text style={styles.statusText}>{statusLabels[task.status]}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    ...theme.shadows.medium, // Кроссплатформенная тень
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  description: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  status: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
```

### 2. CategoryFilter - Горизонтальный фильтр

```tsx
// src/components/CategoryFilter.tsx
export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const categories: Array<{ key: TaskCategory | null; label: string; icon: string }> = [
    { key: null, label: 'Все', icon: '🏠' },
    { key: 'repair', label: 'Ремонт', icon: '🔧' },
    { key: 'delivery', label: 'Доставка', icon: '📦' },
    { key: 'pets', label: 'Питомцы', icon: '🐾' },
    { key: 'other', label: 'Другое', icon: '📋' },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.key ?? 'all'}
          style={[
            styles.chip,
            selected === cat.key && styles.chipActive,
          ]}
          onPress={() => onSelect(cat.key)}
        >
          <Text style={styles.chipIcon}>{cat.icon}</Text>
          <Text style={[
            styles.chipLabel,
            selected === cat.key && styles.chipLabelActive,
          ]}>
            {cat.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  chipActive: {
    backgroundColor: '#6200EE',
    borderColor: '#6200EE',
  },
  chipLabel: {
    marginLeft: 6,
    fontSize: 14,
    color: '#757575',
  },
  chipLabelActive: {
    color: '#FFF',
    fontWeight: '600',
  },
});
```

### 3. Состояния загрузки/ошибки/пустоты

```tsx
// LoadingState - индикатор загрузки
export function LoadingState({ message = 'Загрузка...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6200EE" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

// ErrorState - состояние ошибки с retry
export function ErrorState({ message, onRetry }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>❌</Text>
      <Text style={styles.title}>Что-то пошло не так</Text>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
        <Text style={styles.retryText}>Попробовать снова</Text>
      </TouchableOpacity>
    </View>
  );
}

// EmptyState - пустое состояние
export function EmptyState({ icon, title, description }) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}
```

## Функциональные улучшения

### 1. Pull-to-Refresh

```tsx
// TaskListScreen.tsx
const [refreshing, setRefreshing] = useState(false);

const handleRefresh = async () => {
  setRefreshing(true);
  await refetch();
  setRefreshing(false);
};

<FlatList
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      colors={['#6200EE']}     // Android
      tintColor="#6200EE"       // iOS
    />
  }
/>
```

### 2. Система кармы

```tsx
// ProfileScreen.tsx - геймификация
const karmaLevels = [
  { min: 0, label: 'Новичок', icon: '🌱' },
  { min: 50, label: 'Сосед', icon: '🏠' },
  { min: 200, label: 'Добряк', icon: '⭐' },
  { min: 500, label: 'Легенда подъезда', icon: '👑' },
];

// Прогресс-бар кармы
<View style={styles.progressContainer}>
  <View style={styles.progressBar}>
    <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
  </View>
  <Text style={styles.progressText}>{karma} / {nextLevel}</Text>
</View>
```

### 3. Визуальный отклик

```tsx
// Кнопки с обратной связью
<TouchableOpacity
  activeOpacity={0.7}           // Прозрачность при нажатии
  style={styles.button}
  onPress={handlePress}
>
  <Text>Нажми меня</Text>
</TouchableOpacity>

// PlatformButton с нативным ripple эффектом на Android
export function PlatformButton({ onPress, title, style }) {
  if (Platform.OS === 'android') {
    return (
      <TouchableNativeFeedback
        onPress={onPress}
        background={TouchableNativeFeedback.Ripple('#rgba(98, 0, 238, 0.3)', false)}
      >
        <View style={[styles.button, style]}>
          <Text style={styles.buttonText}>{title}</Text>
        </View>
      </TouchableNativeFeedback>
    );
  }

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}
```

## UX паттерны

### 1. Обработка длинного текста
```tsx
<Text numberOfLines={2} ellipsizeMode="tail">
  Очень длинный текст будет обрезан...
</Text>
```

### 2. Безопасные области
```tsx
import { SafeAreaView } from 'react-native-safe-area-context';

<SafeAreaView edges={['bottom']}>
  {/* Контент не перекрывается notch и home indicator */}
</SafeAreaView>
```

### 3. Keyboard Avoiding
```tsx
import { KeyboardAvoidingView, Platform } from 'react-native';

<KeyboardAvoidingView
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  style={styles.container}
>
  <TextInput placeholder="Введите текст" />
</KeyboardAvoidingView>
```

## Вопросы для защиты

1. **Почему важна дизайн-система?**
   - Консистентность интерфейса
   - Быстрая разработка новых экранов
   - Легкость поддержки и изменений
   - Единый язык с дизайнерами

2. **Чем отличаются тени на iOS и Android?**
   - iOS: shadowColor, shadowOffset, shadowOpacity, shadowRadius
   - Android: elevation (одно свойство)
   - Platform.select() для кроссплатформенности

3. **Зачем нужен RefreshControl?**
   - Паттерн Pull-to-Refresh для обновления данных
   - Стандартный UX для мобильных приложений
   - Визуальная обратная связь пользователю

4. **Как улучшить perceived performance?**
   - Показывать skeleton/loading сразу
   - Optimistic updates
   - Кэширование данных
   - Lazy loading изображений

5. **Что такое геймификация?**
   - Игровые механики в неигровом контексте
   - Система кармы/очков мотивирует пользователей
   - Уровни дают ощущение прогресса

## Ссылки
- [Material Design Guidelines](https://material.io/design)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [React Native StyleSheet](https://reactnative.dev/docs/stylesheet)
