import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, Task } from '../types';
import { getTaskById, getTaskCreatorName } from '../api';
import { useResponses } from '../hooks';
import {
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
} from '../utils/constants';
import { formatDate } from '../utils/helpers';
import { LoadingState, ErrorState, VideoPlayer } from '../components';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;

export function TaskDetailScreen({ route }: Props) {
  const { taskId } = route.params;
  const { hasResponded, respond } = useResponses();

  const [task, setTask] = useState<Task | null>(null);
  const [creatorName, setCreatorName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const responded = hasResponded(taskId);

  useEffect(() => {
    let isMounted = true;

    const loadTask = async () => {
      try {
        setLoading(true);
        setError(null);

        const taskData = await getTaskById(taskId);
        if (!isMounted) return;

        setTask(taskData);

        const name = await getTaskCreatorName(taskData.creator_id);
        if (isMounted) {
          setCreatorName(name);
        }
      } catch (e) {
        if (isMounted) {
          setError(e instanceof Error ? e : new Error('Ошибка загрузки'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTask();

    return () => {
      isMounted = false;
    };
  }, [taskId]);

  const handleRespond = async () => {
    await respond(taskId);
  };

  if (loading) {
    return <LoadingState message="Загружаем задачу..." />;
  }

  if (error || !task) {
    return <ErrorState message={error?.message ?? 'Задача не найдена'} />;
  }

  const statusColor = STATUS_COLORS[task.status];
  const canRespond = task.status === 'open' && !responded;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.categoryIcon}>{CATEGORY_ICONS[task.category]}</Text>
          <View style={styles.headerInfo}>
            <Text style={styles.category}>{CATEGORY_LABELS[task.category]}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusText}>{STATUS_LABELS[task.status]}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.title}>{task.title}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Создал:</Text>
          <Text style={styles.metaValue}>{creatorName}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Когда:</Text>
          <Text style={styles.metaValue}>{formatDate(task.created_at)}</Text>
        </View>

        <View style={styles.descriptionBlock}>
          <Text style={styles.descriptionLabel}>Описание</Text>
          <Text style={styles.description}>{task.description}</Text>
        </View>

        {task.image_url && (
          <View style={styles.mediaBlock}>
            <Text style={styles.mediaLabel}>Фото</Text>
            <Image source={{ uri: task.image_url }} style={styles.taskImage} />
          </View>
        )}

        {task.video_url && (
          <View style={styles.mediaBlock}>
            <Text style={styles.mediaLabel}>Видео</Text>
            <VideoPlayer uri={task.video_url} />
          </View>
        )}

        {canRespond && (
          <TouchableOpacity style={styles.respondButton} onPress={handleRespond}>
            <Text style={styles.respondButtonText}>Откликнуться</Text>
          </TouchableOpacity>
        )}

        {responded && (
          <View style={styles.respondedBanner}>
            <Text style={styles.respondedText}>Вы откликнулись на задачу</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  categoryIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  category: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  metaRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  metaLabel: {
    fontSize: 14,
    color: '#999',
    width: 80,
  },
  metaValue: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  descriptionBlock: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  mediaBlock: {
    marginTop: 20,
  },
  mediaLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  taskImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  respondButton: {
    marginTop: 24,
    backgroundColor: '#6200EE',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  respondButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  respondedBanner: {
    marginTop: 24,
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  respondedText: {
    color: '#2E7D32',
    fontSize: 16,
    fontWeight: '500',
  },
});
