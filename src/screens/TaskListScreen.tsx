/**
 * TaskListScreen - главный экран со списком задач
 *
 * Демонстрирует:
 * - FlatList для оптимизированного отображения списков
 * - Pull-to-refresh через RefreshControl
 * - Фильтрацию с мемоизацией (useMemo)
 * - Паттерн Loading/Error/Empty states
 * - Навигацию на детальный экран
 * - Современный UI с поиском и приветствием
 * - Сортировка по срочности
 * - Быстрые действия (отклик, закладки)
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  FlatList,
  StyleSheet,
  RefreshControl,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

// Cross-platform alert that works on web
const showAlert = (title: string, message?: string) => {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
};
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, TaskCategory } from '../types';
import { useTasks, useBookmarks } from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import { respondToTask } from '../api';
import { mockAnnouncements } from '../api/mockData';
import {
  TaskCard,
  ErrorState,
  EmptyState,
  CategoryFilter,
  SkeletonLoader,
  AnnouncementCard,
  QuickActions,
} from '../components';
import { colors, spacing, borderRadius, shadows } from '../utils/theme';
import { filterTasksBySearch, sortByUrgency, countTasksByCategory } from '../utils/helpers';

// Типы сортировки
type SortType = 'urgency' | 'date';
const SORT_LABELS: Record<SortType, string> = {
  urgency: 'По срочности',
  date: 'По дате',
};

// Типизация props с навигацией
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export function TaskListScreen({ navigation }: Props) {
  // Получаем задачи через кастомный хук
  const { tasks, loading, error, refetch } = useTasks();

  // Обновляем список задач при фокусе на экране
  // Это обеспечивает появление новых задач после создания
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Получаем пользователя для приветствия
  const { user } = useAuth();

  // Хук для закладок
  const { bookmarks, toggleBookmark, isBookmarked } = useBookmarks();

  // Локальное состояние для pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // Выбранная категория для фильтрации (null = все категории)
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | null>(null);

  // Состояние поискового запроса
  const [searchQuery, setSearchQuery] = useState('');

  // Тип сортировки
  const [sortType, setSortType] = useState<SortType>('urgency');

  // Подсчет задач по категориям
  const categoryCounts = useMemo(() => countTasksByCategory(tasks), [tasks]);

  /**
   * useMemo мемоизирует результат фильтрации
   * Пересчитывается только при изменении tasks, selectedCategory, searchQuery или sortType
   */
  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Фильтрация по категории
    if (selectedCategory) {
      result = result.filter((task) => task.category === selectedCategory);
    }

    // Фильтрация по поисковому запросу
    if (searchQuery.trim()) {
      result = filterTasksBySearch(result, searchQuery);
    }

    // Сортировка
    if (sortType === 'urgency') {
      return sortByUrgency(result);
    } else {
      // Сортировка по дате (новые первые)
      return [...result].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  }, [tasks, selectedCategory, searchQuery, sortType]);

  /**
   * Обработчик pull-to-refresh
   */
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  /**
   * Обработчик нажатия на карточку задачи
   */
  const handleTaskPress = (taskId: string) => {
    navigation.navigate('TaskDetail', { taskId });
  };

  /**
   * Быстрый отклик на задачу
   */
  const handleQuickRespond = useCallback(async (taskId: string) => {
    if (!user) {
      showAlert('Авторизация', 'Войдите, чтобы откликнуться на задачу');
      return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (task?.creator_id === user.id) {
      showAlert('Ошибка', 'Нельзя откликнуться на свою задачу');
      return;
    }

    try {
      await respondToTask(taskId, user.id, 'Готов помочь!');
      showAlert('Успех!', 'Вы откликнулись на задачу');
      refetch();
    } catch (e) {
      console.error('Respond error:', e);
      showAlert('Ошибка', 'Не удалось откликнуться');
    }
  }, [user, tasks, refetch]);

  /**
   * Переключение сортировки
   */
  const toggleSort = () => {
    console.log('Sort toggled, current:', sortType);
    setSortType(prev => {
      const newSort = prev === 'urgency' ? 'date' : 'urgency';
      console.log('New sort:', newSort);
      return newSort;
    });
  };

  /**
   * Перейти к созданию задачи
   */
  const handleCreateTask = () => {
    navigation.navigate('CreateTask');
  };

  /**
   * Обработчик нажатия на быстрое действие
   *
   * Переходит на экран создания задачи с предзаполненными
   * категорией и заголовком для ускорения процесса.
   */
  const handleQuickAction = useCallback((category: TaskCategory, title: string) => {
    navigation.navigate('CreateTask', {
      initialCategory: category,
      initialTitle: title,
    });
  }, [navigation]);

  // Получаем приветствие в зависимости от времени суток
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 6) return 'Доброй ночи';
    if (hour < 12) return 'Доброе утро';
    if (hour < 18) return 'Добрый день';
    return 'Добрый вечер';
  };

  // Получаем имя пользователя
  const userName = user?.name?.split(' ')[0] || 'Сосед';

  // === ПАТТЕРН: Loading/Error/Empty States ===

  // Состояние загрузки (но не при pull-to-refresh)
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <SkeletonLoader count={5} />
      </SafeAreaView>
    );
  }

  // Состояние ошибки с возможностью повторить запрос
  if (error) {
    return <ErrorState message={error.message} onRetry={refetch} />;
  }

  // Рендер заголовка списка
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Greeting section */}
      <View style={styles.greetingSection}>
        <Text style={styles.greeting}>{getGreeting()}, {userName}!</Text>
        <Text style={styles.subtitle}>Чем помочь соседям сегодня?</Text>
      </View>

      {/* Announcements section */}
      <View style={styles.announcementsSection}>
        <Text style={styles.announcementsTitle}>Объявления дома</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.announcementsList}
        >
          {mockAnnouncements.map((announcement) => (
            <AnnouncementCard key={announcement.id} announcement={announcement} />
          ))}
        </ScrollView>
      </View>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Поиск задач..."
          placeholderTextColor={colors.text.tertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <Text
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            ✕
          </Text>
        )}
      </View>

      {/* Category filter */}
      <CategoryFilter
        selected={selectedCategory}
        onSelect={setSelectedCategory}
        counts={categoryCounts}
      />

      {/* Sort toggle */}
      <View style={styles.sortContainer}>
        <Text style={styles.sortLabel}>Сортировка:</Text>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={toggleSort}
          activeOpacity={0.7}
        >
          <Text style={styles.sortButtonText}>{SORT_LABELS[sortType]}</Text>
          <Text style={styles.sortIcon}>↕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Пустое состояние - когда задач нет вообще
  if (tasks.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {renderHeader()}
        <EmptyState
          icon="🏠"
          title="Пока нет задач"
          description="Станьте первым, кто попросит о помощи!"
          actionLabel="Создать первую задачу"
          onAction={handleCreateTask}
        />
      </SafeAreaView>
    );
  }

  // Основной UI со списком задач
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <TaskCard
            task={item}
            onPress={() => handleTaskPress(item.id)}
            index={index}
            onQuickRespond={user?.id !== item.creator_id && item.status === 'open' ? handleQuickRespond : undefined}
            onBookmark={toggleBookmark}
            isBookmarked={isBookmarked(item.id)}
          />
        )}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="🔍"
            title="Ничего не найдено"
            description={
              searchQuery
                ? 'Попробуйте изменить запрос'
                : 'В этой категории пока нет задач'
            }
            actionLabel={!searchQuery ? 'Создать задачу' : undefined}
            onAction={!searchQuery ? handleCreateTask : undefined}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    paddingTop: spacing.lg,
  },
  greetingSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  announcementsSection: {
    marginBottom: spacing.lg,
  },
  announcementsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  announcementsList: {
    paddingHorizontal: spacing.lg,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
  },
  clearButton: {
    fontSize: 16,
    color: colors.text.tertiary,
    padding: spacing.sm,
  },
  list: {
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
  },
  sortLabel: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginRight: spacing.sm,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    cursor: 'pointer',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginRight: spacing.xs,
  },
  sortIcon: {
    fontSize: 14,
    color: colors.primary,
  },
});
