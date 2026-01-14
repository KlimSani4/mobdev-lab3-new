import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import type { TaskCategory } from '../types';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '../utils/constants';
import { colors, spacing, borderRadius } from '../utils/theme';

interface CategoryFilterProps {
  selected: TaskCategory | null;
  onSelect: (category: TaskCategory | null) => void;
}

const CATEGORIES: (TaskCategory | null)[] = [null, 'delivery', 'tools', 'pets', 'other'];

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map((category) => {
        const isActive = selected === category;
        return (
          <TouchableOpacity
            key={category ?? 'all'}
            style={[styles.chip, isActive && styles.chipActive]}
            onPress={() => onSelect(category)}
          >
            <Text style={styles.chipIcon}>
              {category ? CATEGORY_ICONS[category] : '📋'}
            </Text>
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {category ? CATEGORY_LABELS[category] : 'Все'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.background,
    gap: spacing.xs,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipIcon: {
    fontSize: 16,
  },
  chipText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  chipTextActive: {
    color: colors.text.inverse,
    fontWeight: '500',
  },
});
