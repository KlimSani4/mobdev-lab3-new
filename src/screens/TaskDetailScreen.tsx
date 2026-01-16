import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Share,
  Linking,
  Platform,
} from 'react-native';

// Cross-platform alert
const showAlert = (title: string, message?: string, buttons?: Array<{text: string; style?: string; onPress?: () => void}>) => {
  if (Platform.OS === 'web') {
    const fullMessage = message ? `${title}\n\n${message}` : title;
    if (buttons && buttons.length > 1) {
      // Simple confirm for web
      const confirmed = window.confirm(fullMessage);
      if (confirmed) {
        const confirmButton = buttons.find(b => b.style !== 'cancel');
        confirmButton?.onPress?.();
      }
    } else {
      window.alert(fullMessage);
      buttons?.[0]?.onPress?.();
    }
  } else {
    Alert.alert(title, message, buttons);
  }
};
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList, Task } from '../types';
import { getTaskById, respondToTask } from '../api';
import { useAuth } from '../contexts/AuthContext';
import {
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  URGENCY_LABELS,
  URGENCY_COLORS,
} from '../utils/constants';
import { timeAgo } from '../utils/helpers';
import { LoadingState, ErrorState, VideoPlayer } from '../components';
import { colors, spacing, borderRadius, shadows, categoryColors } from '../utils/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskDetail'>;

export function TaskDetailScreen({ route, navigation }: Props) {
  const { taskId } = route.params;
  const { user, isGuest, requireAuth } = useAuth();

  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [responding, setResponding] = useState(false);
  const [hasResponded, setHasResponded] = useState(false);

  // Сбрасываем состояние при смене задачи
  useEffect(() => {
    setTask(null);
    setHasResponded(false);
    setError(null);
  }, [taskId]);

  useEffect(() => {
    let isMounted = true;

    const loadTask = async () => {
      try {
        setLoading(true);
        setError(null);
        setHasResponded(false); // Сбрасываем состояние отклика

        const taskData = await getTaskById(taskId);
        if (!isMounted) return;

        setTask(taskData);

        // Проверяем, откликался ли текущий пользователь
        let responded = false;
        if (user && taskData.responses && Array.isArray(taskData.responses) && taskData.responses.length > 0) {
          const userResponse = taskData.responses.find(r => {
            const respUserId = r.userId || r.user_id || r.user?.id;
            return String(respUserId) === String(user.id);
          });
          responded = !!userResponse;
        }
        setHasResponded(responded);
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
  }, [taskId, user]);

  const handleRespond = async () => {
    // Проверяем авторизацию - если гость, показываем модальное окно входа
    if (!requireAuth()) {
      return;
    }

    if (!user) {
      // На случай если пользователь закрыл модальное окно
      return;
    }

    try {
      setResponding(true);
      await respondToTask(taskId, user.id, 'Хочу помочь!');
      setHasResponded(true);
      showAlert('Успех', 'Вы откликнулись на задачу');
    } catch (e) {
      showAlert('Ошибка', 'Не удалось откликнуться');
    } finally {
      setResponding(false);
    }
  };

  /**
   * Поделиться задачей
   */
  const handleShare = async () => {
    if (!task) return;

    try {
      await Share.share({
        message: `Нужна помощь: ${task.title}\n\n${task.description}\n\nКатегория: ${CATEGORY_LABELS[task.category]}`,
        title: task.title,
      });
    } catch (error) {
      // Пользователь отменил шаринг - ничего не делаем
    }
  };

  /**
   * Связаться с автором задачи по телефону
   */
  const handleCallAuthor = () => {
    if (!requireAuth()) {
      return;
    }

    if (!task?.author?.phone) {
      showAlert('Ошибка', 'Контакт автора недоступен');
      return;
    }

    const phone = task.author.phone.replace(/\D/g, '');
    const phoneUrl = `tel:${phone}`;
    Linking.openURL(phoneUrl).catch(() => {
      showAlert('Ошибка', 'Не удалось открыть телефон');
    });
  };

  /**
   * Написать автору в чат
   */
  const handleWriteToAuthor = () => {
    if (!requireAuth()) {
      return;
    }

    if (!task?.author) {
      showAlert('Ошибка', 'Автор недоступен');
      return;
    }

    navigation.navigate('Chat', {
      recipientId: task.creator_id,
      recipientName: task.author.name || 'Автор задачи',
      taskId: task.id,
      taskTitle: task.title,
    });
  };

  if (loading) {
    return <LoadingState message="Загружаем задачу..." />;
  }

  if (error || !task) {
    return <ErrorState message={error?.message ?? 'Задача не найдена'} />;
  }

  const statusColor = STATUS_COLORS[task.status];
  const categoryColor = categoryColors[task.category] || colors.primary;
  // Гости тоже видят кнопку "Откликнуться" (при нажатии получат промпт входа)
  // Авторизованные пользователи не видят кнопку для своих задач и если уже откликнулись
  const canRespond = task.status === 'open' && !hasResponded && (isGuest || user?.id !== task.creator_id);
  const creatorName = task.author?.name || 'Неизвестный';
  const responsesCount = task._count?.responses ?? task.responses?.length ?? 0;
  const urgencyColor = task.urgency ? URGENCY_COLORS[task.urgency] : undefined;
  const urgencyLabel = task.urgency ? URGENCY_LABELS[task.urgency] : undefined;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header with category accent */}
        <View style={[styles.headerAccent, { backgroundColor: categoryColor }]} />

        <View style={styles.header}>
          <View style={[styles.categoryIconBg, { backgroundColor: `${categoryColor}20` }]}>
            <Text style={styles.categoryIcon}>{CATEGORY_ICONS[task.category]}</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.category, { color: categoryColor }]}>
              {CATEGORY_LABELS[task.category]}
            </Text>
            <View style={styles.badgesRow}>
              <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
                <Text style={styles.statusText}>{STATUS_LABELS[task.status]}</Text>
              </View>
              {urgencyLabel && task.urgency !== 'low' && (
                <View style={[styles.urgencyBadge, { backgroundColor: `${urgencyColor}20` }]}>
                  <View style={[styles.urgencyDot, { backgroundColor: urgencyColor }]} />
                  <Text style={[styles.urgencyText, { color: urgencyColor }]}>
                    {urgencyLabel}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        <Text style={styles.title}>{task.title}</Text>

        {/* Meta info */}
        <View style={styles.metaSection}>
          <View style={styles.metaRow}>
            <Text style={styles.metaIcon}>👤</Text>
            <Text style={styles.metaLabel}>Автор:</Text>
            <Text style={styles.metaValue}>{creatorName}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={styles.metaIcon}>🕐</Text>
            <Text style={styles.metaLabel}>Когда:</Text>
            <Text style={styles.metaValue}>{timeAgo(task.created_at)}</Text>
          </View>

          {responsesCount > 0 && (
            <View style={styles.metaRow}>
              <Text style={styles.metaIcon}>💬</Text>
              <Text style={styles.metaLabel}>Откликов:</Text>
              <Text style={[styles.metaValue, styles.responsesValue]}>
                {responsesCount}
              </Text>
            </View>
          )}

          {task.reward && task.reward > 0 && (
            <View style={styles.metaRow}>
              <Text style={styles.metaIcon}>💰</Text>
              <Text style={styles.metaLabel}>Награда:</Text>
              <Text style={[styles.metaValue, styles.rewardValue]}>
                {task.reward} руб.
              </Text>
            </View>
          )}
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
          <TouchableOpacity
            style={[styles.respondButton, responding && styles.respondButtonDisabled]}
            onPress={handleRespond}
            disabled={responding}
          >
            <Text style={styles.respondButtonText}>
              {responding ? 'Отправка...' : 'Откликнуться'}
            </Text>
          </TouchableOpacity>
        )}

        {hasResponded && (
          <View style={styles.respondedBanner}>
            <Text style={styles.respondedIcon}>✓</Text>
            <Text style={styles.respondedText}>Вы откликнулись на задачу</Text>
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Text style={styles.actionButtonIcon}>📤</Text>
            <Text style={styles.actionButtonText}>Поделиться</Text>
          </TouchableOpacity>

          {user?.id !== task.creator_id && (
            <TouchableOpacity
              style={[styles.actionButton, styles.writeButton]}
              onPress={handleWriteToAuthor}
            >
              <Text style={styles.actionButtonIcon}>💬</Text>
              <Text style={[styles.actionButtonText, styles.writeButtonText]}>
                Написать
              </Text>
            </TouchableOpacity>
          )}

          {task.author?.phone && user?.id !== task.creator_id && Platform.OS !== 'web' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.contactButton]}
              onPress={handleCallAuthor}
            >
              <Text style={styles.actionButtonIcon}>📞</Text>
              <Text style={[styles.actionButtonText, styles.contactButtonText]}>
                Позвонить
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  headerAccent: {
    height: 6,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
    paddingBottom: spacing.md,
  },
  categoryIconBg: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.lg,
  },
  categoryIcon: {
    fontSize: 28,
  },
  headerInfo: {
    flex: 1,
  },
  category: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    color: colors.text.inverse,
    fontSize: 12,
    fontWeight: '600',
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  urgencyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    lineHeight: 32,
  },
  metaSection: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metaIcon: {
    fontSize: 14,
    marginRight: spacing.sm,
    width: 20,
    textAlign: 'center',
  },
  metaLabel: {
    fontSize: 14,
    color: colors.text.tertiary,
    width: 80,
  },
  metaValue: {
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
    fontWeight: '500',
  },
  responsesValue: {
    color: colors.primary,
  },
  rewardValue: {
    color: colors.warning,
  },
  descriptionBlock: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  descriptionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
  },
  mediaBlock: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  mediaLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.tertiary,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taskImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceSecondary,
  },
  respondButton: {
    marginHorizontal: spacing.xl,
    marginTop: spacing.xxl,
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    ...shadows.medium,
  },
  respondButtonDisabled: {
    opacity: 0.6,
  },
  respondButtonText: {
    color: colors.text.inverse,
    fontSize: 17,
    fontWeight: '600',
  },
  respondedBanner: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginTop: spacing.xxl,
    backgroundColor: colors.successLight,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  respondedIcon: {
    fontSize: 18,
    color: colors.success,
  },
  respondedText: {
    color: colors.success,
    fontSize: 15,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  contactButton: {
    backgroundColor: colors.successLight,
    borderColor: colors.success,
  },
  writeButton: {
    backgroundColor: colors.primaryLight + '15',
    borderColor: colors.primary,
  },
  actionButtonIcon: {
    fontSize: 16,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  contactButtonText: {
    color: colors.success,
  },
  writeButtonText: {
    color: colors.primary,
  },
});
