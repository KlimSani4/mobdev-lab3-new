import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { Task } from '../types';
import {
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
} from '../utils/constants';
import { formatDate } from '../utils/helpers';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
}

export function TaskCard({ task, onPress }: TaskCardProps) {
  const statusColor = STATUS_COLORS[task.status];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.categoryIcon}>
          {CATEGORY_ICONS[task.category]}
        </Text>
        <Text style={styles.category}>{CATEGORY_LABELS[task.category]}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{STATUS_LABELS[task.status]}</Text>
        </View>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {task.title}
      </Text>

      <Text style={styles.description} numberOfLines={2}>
        {task.description}
      </Text>

      <Text style={styles.date}>{formatDate(task.created_at)}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  category: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});
