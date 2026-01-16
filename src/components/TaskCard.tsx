import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import type { Task, TaskUrgency } from '../types';
import {
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  STATUS_LABELS,
  URGENCY_LABELS,
  URGENCY_COLORS,
} from '../utils/constants';
import { timeAgo } from '../utils/helpers';
import { colors, shadows, borderRadius, spacing, categoryColors } from '../utils/theme';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  /** Индекс карточки в списке для каскадной анимации появления */
  index?: number;
  /** Кнопка быстрого отклика */
  onQuickRespond?: (taskId: string) => void;
  /** Кнопка сохранения в закладки */
  onBookmark?: (taskId: string) => void;
  /** Задача в закладках */
  isBookmarked?: boolean;
}

// Helper to determine urgency based on task urgency field or age
function getUrgency(task: Task): TaskUrgency {
  // Если у задачи есть поле urgency, используем его
  if (task.urgency) return task.urgency;

  // Иначе вычисляем по возрасту
  const now = new Date();
  const created = new Date(task.created_at);
  const hoursDiff = (now.getTime() - created.getTime()) / (1000 * 60 * 60);

  if (hoursDiff < 2) return 'urgent';
  if (hoursDiff < 6) return 'high';
  if (hoursDiff < 24) return 'medium';
  return 'low';
}

// Urgency indicator config
const urgencyConfig: Record<TaskUrgency, { color: string; label: string }> = {
  urgent: { color: URGENCY_COLORS.urgent, label: URGENCY_LABELS.urgent },
  high: { color: URGENCY_COLORS.high, label: URGENCY_LABELS.high },
  medium: { color: URGENCY_COLORS.medium, label: URGENCY_LABELS.medium },
  low: { color: URGENCY_COLORS.low, label: URGENCY_LABELS.low },
};

// Status background colors
const statusBgColors = {
  open: colors.success,
  in_progress: colors.warning,
  completed: colors.text.tertiary,
};

/**
 * TaskCard - карточка задачи с анимациями и современным дизайном
 *
 * Анимации:
 * 1. Fade-in при появлении (opacity 0 -> 1)
 * 2. Slide-up при появлении (translateY)
 * 3. Scale при нажатии (уменьшение при press, spring обратно при release)
 *
 * Дизайн:
 * - Цветовой акцент категории
 * - Индикатор срочности
 * - Бейдж награды
 * - Время создания
 * - Кнопки быстрого отклика и закладок
 */
export function TaskCard({
  task,
  onPress,
  index = 0,
  onQuickRespond,
  onBookmark,
  isBookmarked = false
}: TaskCardProps) {
  const urgency = getUrgency(task);
  const urgencyInfo = urgencyConfig[urgency];
  const categoryColor = categoryColors[task.category] || colors.primary;

  // Animated.Value для появления карточки (fade + slide)
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animated.Value для scale эффекта при нажатии
  const scaleAnim = useRef(new Animated.Value(1)).current;

  /**
   * Анимация появления при монтировании компонента
   * Каждая следующая карточка появляется с небольшой задержкой (каскадный эффект)
   */
  useEffect(() => {
    const delay = Math.min(index * 60, 300);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, index]);

  /**
   * Обработчик нажатия (press in)
   */
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  /**
   * Обработчик отпускания (press out)
   */
  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  // Интерполяция для slide-up эффекта
  const translateY = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ translateY }, { scale: scaleAnim }],
          },
        ]}
      >
        {/* Category accent bar */}
        <View style={[styles.accentBar, { backgroundColor: categoryColor }]} />

        <View style={styles.content}>
          {/* Header row */}
          <View style={styles.header}>
            <View style={styles.categoryContainer}>
              <View style={[styles.categoryIconBg, { backgroundColor: `${categoryColor}15` }]}>
                <Text style={styles.categoryIcon}>
                  {CATEGORY_ICONS[task.category]}
                </Text>
              </View>
              <Text style={[styles.categoryText, { color: categoryColor }]}>
                {CATEGORY_LABELS[task.category]}
              </Text>
            </View>

            <View style={styles.headerRight}>
              {/* Urgency indicator */}
              {urgency !== 'low' && (
                <View style={[styles.urgencyBadge, { backgroundColor: `${urgencyInfo.color}15` }]}>
                  <View style={[styles.urgencyDot, { backgroundColor: urgencyInfo.color }]} />
                  <Text style={[styles.urgencyText, { color: urgencyInfo.color }]}>
                    {urgencyInfo.label}
                  </Text>
                </View>
              )}

              {/* Status badge */}
              <View style={[styles.statusBadge, { backgroundColor: statusBgColors[task.status] }]}>
                <Text style={styles.statusText}>{STATUS_LABELS[task.status]}</Text>
              </View>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title} numberOfLines={2}>
            {task.title}
          </Text>

          {/* Description */}
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.footerLeft}>
              {/* Reward badge */}
              {task.reward && task.reward > 0 && (
                <View style={styles.rewardBadge}>
                  <Text style={styles.rewardIcon}>💰</Text>
                  <Text style={styles.rewardText}>{task.reward} руб.</Text>
                </View>
              )}
            </View>

            <View style={styles.footerRight}>
              {/* Time ago */}
              <Text style={styles.timeAgo}>{timeAgo(task.created_at)}</Text>

              {/* Response count */}
              {task._count?.responses !== undefined && task._count.responses > 0 && (
                <View style={styles.responsesCount}>
                  <Text style={styles.responsesIcon}>💬</Text>
                  <Text style={styles.responsesText}>{task._count.responses}</Text>
                </View>
              )}
            </View>
          </View>

          {/* Quick Actions */}
          {(onQuickRespond || onBookmark) && task.status === 'open' && (
            <View style={styles.quickActions}>
              {onBookmark && (
                <TouchableOpacity
                  style={[styles.quickActionButton, isBookmarked && styles.quickActionActive]}
                  onPress={() => onBookmark(task.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.quickActionIcon}>
                    {isBookmarked ? '⭐' : '☆'}
                  </Text>
                  <Text style={[styles.quickActionText, isBookmarked && styles.quickActionTextActive]}>
                    {isBookmarked ? 'Сохранено' : 'Сохранить'}
                  </Text>
                </TouchableOpacity>
              )}
              {onQuickRespond && (
                <TouchableOpacity
                  style={[styles.quickActionButton, styles.quickRespondButton]}
                  onPress={() => onQuickRespond(task.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.quickActionIcon}>✋</Text>
                  <Text style={[styles.quickActionText, styles.quickRespondText]}>
                    Откликнуться
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    overflow: 'hidden',
    ...shadows.card,
  },
  accentBar: {
    height: 4,
    width: '100%',
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryIconBg: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
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
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
  },
  statusText: {
    color: colors.text.inverse,
    fontSize: 11,
    fontWeight: '600',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    lineHeight: 24,
  },
  description: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rewardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: 4,
  },
  rewardIcon: {
    fontSize: 12,
  },
  rewardText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B45309',
  },
  timeAgo: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  responsesCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  responsesIcon: {
    fontSize: 12,
  },
  responsesText: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceSecondary,
    gap: spacing.xs,
  },
  quickActionActive: {
    backgroundColor: colors.warningLight,
  },
  quickRespondButton: {
    backgroundColor: colors.primaryLight + '20',
  },
  quickActionIcon: {
    fontSize: 14,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  quickActionTextActive: {
    color: colors.warning,
  },
  quickRespondText: {
    color: colors.primary,
  },
});
