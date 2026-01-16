/**
 * QuickActions - горизонтальная полоска быстрых действий
 *
 * Компонент предоставляет пользователю быстрый доступ к типичным
 * соседским просьбам одним нажатием. Каждая кнопка открывает
 * экран создания задачи с предзаполненной категорией и названием.
 *
 * Особенности:
 * - Горизонтальный скролл для компактного отображения
 * - Premium дизайн с тенями и градиентами
 * - Анимация нажатия (scale) для тактильной обратной связи
 * - Доступ к часто используемым типам просьб
 */
import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import type { TaskCategory } from '../types';
import { colors, spacing, borderRadius, shadows } from '../utils/theme';

/**
 * Структура быстрого действия
 */
interface QuickAction {
  id: string;
  icon: string;
  label: string;
  category: TaskCategory;
  title: string;
  color: string;
}

/**
 * Предустановленные быстрые действия для типичных соседских просьб
 */
const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'tool',
    icon: '\uD83D\uDD27', // wrench emoji
    label: 'Нужен инструмент',
    category: 'repair',
    title: 'Нужен инструмент',
    color: '#6366F1', // primary/indigo
  },
  {
    id: 'package',
    icon: '\uD83D\uDCE6', // package emoji
    label: 'Помощь с посылкой',
    category: 'delivery',
    title: 'Помощь с посылкой',
    color: '#10B981', // success/green
  },
  {
    id: 'pet',
    icon: '\uD83D\uDC15', // dog emoji
    label: 'Выгулять питомца',
    category: 'pets',
    title: 'Выгулять питомца',
    color: '#EC4899', // secondary/pink
  },
  {
    id: 'urgent',
    icon: '\uD83D\uDEA8', // emergency emoji
    label: 'Срочная помощь',
    category: 'other',
    title: 'Срочная помощь',
    color: '#EF4444', // error/red
  },
  {
    id: 'ride',
    icon: '\uD83D\uDE97', // car emoji
    label: 'Подвезти',
    category: 'delivery',
    title: 'Нужно подвезти',
    color: '#3B82F6', // info/blue
  },
  {
    id: 'other',
    icon: '\u2795', // plus emoji
    label: 'Другое',
    category: 'other',
    title: '',
    color: '#64748B', // tertiary/gray
  },
];

interface QuickActionsProps {
  /**
   * Callback при нажатии на быстрое действие
   * Передает категорию и заголовок для предзаполнения формы
   */
  onActionPress: (category: TaskCategory, title: string) => void;
}

/**
 * AnimatedButton - кнопка быстрого действия с анимацией
 *
 * При нажатии кнопка слегка уменьшается (scale down),
 * создавая приятную тактильную обратную связь.
 */
function AnimatedButton({
  action,
  onPress,
}: {
  action: QuickAction;
  onPress: () => void;
}) {
  // Animated value для эффекта scale
  const scaleAnim = useRef(new Animated.Value(1)).current;

  /**
   * Анимация при нажатии (press in)
   * Уменьшаем кнопку до 95% размера
   */
  const handlePressIn = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  }, [scaleAnim]);

  /**
   * Анимация при отпускании (press out)
   * Возвращаем кнопку к исходному размеру с пружинящим эффектом
   */
  const handlePressOut = useCallback(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  }, [scaleAnim]);

  return (
    <Animated.View
      style={[
        styles.buttonWrapper,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        style={styles.button}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        {/* Цветной фон иконки */}
        <View style={[styles.iconContainer, { backgroundColor: `${action.color}15` }]}>
          <Text style={styles.icon}>{action.icon}</Text>
        </View>
        {/* Название действия */}
        <Text style={styles.label} numberOfLines={1}>
          {action.label}
        </Text>
        {/* Цветовой акцент снизу */}
        <View style={[styles.colorAccent, { backgroundColor: action.color }]} />
      </TouchableOpacity>
    </Animated.View>
  );
}

/**
 * QuickActions - основной компонент
 *
 * Отображает горизонтально скроллящийся список быстрых действий.
 * Каждое действие - это pill/chip кнопка с иконкой и текстом.
 */
export function QuickActions({ onActionPress }: QuickActionsProps) {
  /**
   * Обработчик нажатия на действие
   * Вызывает callback с категорией и заголовком
   */
  const handleActionPress = useCallback(
    (action: QuickAction) => {
      onActionPress(action.category, action.title);
    },
    [onActionPress]
  );

  return (
    <View style={styles.container}>
      {/* Заголовок секции */}
      <Text style={styles.sectionTitle}>Быстрые действия</Text>

      {/* Горизонтальный скролл с кнопками */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        decelerationRate="fast"
        snapToAlignment="start"
      >
        {QUICK_ACTIONS.map((action) => (
          <AnimatedButton
            key={action.id}
            action={action}
            onPress={() => handleActionPress(action)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  buttonWrapper: {
    // Wrapper для анимации scale
  },
  button: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    minWidth: 100,
    maxWidth: 120,
    alignItems: 'center',
    overflow: 'hidden',
    ...shadows.small,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  icon: {
    fontSize: 22,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  colorAccent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
  },
});
