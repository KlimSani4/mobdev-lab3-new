import React, { useState, useMemo } from 'react';
import { FlatList, StyleSheet, RefreshControl, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, TaskCategory } from '../types';
import { useTasks } from '../hooks';
import { TaskCard, LoadingState, ErrorState, EmptyState, CategoryFilter } from '../components';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

export function TaskListScreen({ navigation }: Props) {
  const { tasks, loading, error, refetch } = useTasks();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | null>(null);

  const filteredTasks = useMemo(() => {
    if (!selectedCategory) return tasks;
    return tasks.filter((task) => task.category === selectedCategory);
  }, [tasks, selectedCategory]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleTaskPress = (taskId: string) => {
    navigation.navigate('TaskDetail', { taskId });
  };

  if (loading && !refreshing) {
    return <LoadingState message="Загружаем задачи..." />;
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={refetch} />;
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon="🏠"
        title="Пока нет задач"
        description="Станьте первым, кто попросит о помощи!"
      />
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.filterContainer}>
        <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} />
      </View>
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard task={item} onPress={() => handleTaskPress(item.id)} />
        )}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#6200EE']}
            tintColor="#6200EE"
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="🔍"
            title="Нет задач"
            description="В этой категории пока нет задач"
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  filterContainer: {
    backgroundColor: '#F5F5F5',
  },
  list: {
    paddingVertical: 8,
    flexGrow: 1,
  },
});
