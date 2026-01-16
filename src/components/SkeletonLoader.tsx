import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { colors, shadows, borderRadius, spacing } from '../utils/theme';

interface SkeletonLoaderProps {
  /** Количество карточек-скелетонов для отображения */
  count?: number;
}

/**
 * SkeletonCardItem - одна карточка-скелетон с shimmer эффектом
 *
 * Shimmer эффект реализован через:
 * 1. LinearGradient эффект (имитация через Animated opacity)
 * 2. Анимированная полоса света, движущаяся слева направо
 *
 * Так как LinearGradient требует дополнительной библиотеки,
 * используем пульсирующую анимацию opacity для похожего эффекта
 */
function SkeletonCardItem({ index }: { index: number }) {
  // Animated.Value для shimmer/pulse анимации
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Создаём бесконечную loop анимацию для shimmer эффекта
    // Задержка зависит от индекса для каскадного эффекта
    const delay = index * 100;

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    // Cleanup при размонтировании
    return () => animation.stop();
  }, [shimmerAnim, index]);

  // Интерполяция для pulse эффекта (opacity: 0.3 -> 0.7)
  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.card}>
      {/* Header skeleton */}
      <View style={styles.header}>
        <Animated.View style={[styles.skeletonCircle, { opacity }]} />
        <Animated.View style={[styles.skeletonTextSmall, { opacity }]} />
        <Animated.View style={[styles.skeletonBadge, { opacity }]} />
      </View>

      {/* Title skeleton */}
      <Animated.View style={[styles.skeletonTitle, { opacity }]} />

      {/* Description skeleton (2 lines) */}
      <Animated.View style={[styles.skeletonLine, { opacity }]} />
      <Animated.View
        style={[styles.skeletonLine, styles.skeletonLineShort, { opacity }]}
      />

      {/* Date skeleton */}
      <Animated.View style={[styles.skeletonDate, { opacity }]} />
    </View>
  );
}

/**
 * SkeletonLoader - компонент загрузки со скелетонами карточек
 *
 * Показывает placeholder карточки с shimmer анимацией
 * пока реальные данные загружаются
 */
export function SkeletonLoader({ count = 4 }: SkeletonLoaderProps) {
  return (
    <View style={styles.container}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCardItem key={index} index={index} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: spacing.sm,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  skeletonCircle: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.md,
    backgroundColor: colors.border,
    marginRight: spacing.sm,
  },
  skeletonTextSmall: {
    width: 80,
    height: 14,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.border,
    flex: 1,
  },
  skeletonBadge: {
    width: 60,
    height: 22,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
  },
  skeletonTitle: {
    width: '80%',
    height: 18,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  skeletonLine: {
    width: '100%',
    height: 14,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.border,
    marginBottom: spacing.sm,
  },
  skeletonLineShort: {
    width: '60%',
    marginBottom: spacing.md,
  },
  skeletonDate: {
    width: 100,
    height: 12,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.border,
  },
});
