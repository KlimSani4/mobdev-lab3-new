import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Animated } from 'react-native';
import type { TaskCategory } from '../types';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '../utils/constants';
import { colors, spacing, borderRadius, categoryColors, shadows } from '../utils/theme';

interface CategoryFilterProps {
  selected: TaskCategory | null;
  onSelect: (category: TaskCategory | null) => void;
  /** Количество задач по категориям */
  counts?: Record<string, number>;
}

const CATEGORIES: (TaskCategory | null)[] = [null, 'delivery', 'repair', 'pets', 'other'];

export function CategoryFilter({ selected, onSelect, counts }: CategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map((category) => {
        const isActive = selected === category;
        const count = category ? counts?.[category] : counts?.all;
        const categoryColor = category ? categoryColors[category] : colors.primary;

        return (
          <TouchableOpacity
            key={category ?? 'all'}
            style={[
              styles.chip,
              isActive && styles.chipActive,
              isActive && { backgroundColor: categoryColor },
            ]}
            onPress={() => onSelect(category)}
            activeOpacity={0.7}
          >
            <View style={[
              styles.iconContainer,
              !isActive && { backgroundColor: `${categoryColor}15` },
              isActive && styles.iconContainerActive,
            ]}>
              <Text style={styles.chipIcon}>
                {category ? CATEGORY_ICONS[category] : '📋'}
              </Text>
            </View>
            <Text style={[
              styles.chipText,
              !isActive && { color: categoryColor },
              isActive && styles.chipTextActive,
            ]}>
              {category ? CATEGORY_LABELS[category] : 'Все'}
            </Text>
            {count !== undefined && count > 0 && (
              <View style={[
                styles.countBadge,
                isActive && styles.countBadgeActive,
              ]}>
                <Text style={[
                  styles.countText,
                  isActive && styles.countTextActive,
                ]}>
                  {count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.xs,
    paddingRight: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    gap: spacing.sm,
    ...shadows.small,
  },
  chipActive: {
    ...shadows.medium,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  chipIcon: {
    fontSize: 16,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.text.inverse,
    fontWeight: '600',
  },
  countBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.tertiary,
  },
  countTextActive: {
    color: colors.text.inverse,
  },
});
