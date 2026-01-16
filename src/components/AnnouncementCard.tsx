/**
 * AnnouncementCard - компактная карточка для объявлений дома
 *
 * Отображает объявления с разными типами:
 * - info (синий) - информационные сообщения
 * - warning (оранжевый) - предупреждения
 * - alert (красный) - срочные оповещения
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { Announcement, AnnouncementType } from '../types';
import { colors, spacing, borderRadius, shadows } from '../utils/theme';

interface AnnouncementCardProps {
  announcement: Announcement;
}

// Конфигурация цветов и иконок для типов объявлений
const typeConfig: Record<
  AnnouncementType,
  { icon: string; color: string; bgColor: string }
> = {
  info: {
    icon: 'i',
    color: colors.info,
    bgColor: colors.infoLight,
  },
  warning: {
    icon: '!',
    color: colors.warning,
    bgColor: colors.warningLight,
  },
  alert: {
    icon: '!!',
    color: colors.error,
    bgColor: colors.errorLight,
  },
};

export function AnnouncementCard({ announcement }: AnnouncementCardProps) {
  const config = typeConfig[announcement.type];

  return (
    <View style={[styles.card, { backgroundColor: config.bgColor }]}>
      {/* Иконка типа */}
      <View style={[styles.iconContainer, { backgroundColor: config.color }]}>
        <Text style={styles.iconText}>{config.icon}</Text>
      </View>

      {/* Контент */}
      <View style={styles.content}>
        <Text style={[styles.title, { color: config.color }]} numberOfLines={1}>
          {announcement.title}
        </Text>
        <Text style={styles.message} numberOfLines={2}>
          {announcement.message}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 260,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginRight: spacing.md,
    ...shadows.small,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
});
