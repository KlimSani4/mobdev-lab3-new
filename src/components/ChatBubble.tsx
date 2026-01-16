/**
 * ChatBubble - компонент пузыря сообщения в чате
 *
 * Отображает сообщение с разными стилями для:
 * - Отправленных сообщений (справа, фиолетовый фон)
 * - Полученных сообщений (слева, серый фон)
 *
 * Включает временную метку под сообщением
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../utils/theme';

export interface ChatMessage {
  id: string;
  text: string;
  timestamp: string;
  isSent: boolean; // true = наше сообщение, false = сообщение собеседника
}

interface ChatBubbleProps {
  message: ChatMessage;
}

/**
 * Форматирует время для отображения в чате
 * Возвращает время в формате HH:MM
 */
function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const { text, timestamp, isSent } = message;

  return (
    <View style={[styles.container, isSent ? styles.sentContainer : styles.receivedContainer]}>
      <View style={[styles.bubble, isSent ? styles.sentBubble : styles.receivedBubble]}>
        <Text style={[styles.text, isSent ? styles.sentText : styles.receivedText]}>
          {text}
        </Text>
      </View>
      <Text style={[styles.timestamp, isSent ? styles.sentTimestamp : styles.receivedTimestamp]}>
        {formatTime(timestamp)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.xs,
    marginHorizontal: spacing.lg,
    maxWidth: '80%',
  },
  sentContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  receivedContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.xl,
  },
  sentBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: spacing.xs,
  },
  receivedBubble: {
    backgroundColor: colors.surfaceSecondary,
    borderBottomLeftRadius: spacing.xs,
  },
  text: {
    fontSize: 15,
    lineHeight: 20,
  },
  sentText: {
    color: colors.text.inverse,
  },
  receivedText: {
    color: colors.text.primary,
  },
  timestamp: {
    fontSize: 11,
    marginTop: spacing.xs,
    color: colors.text.tertiary,
  },
  sentTimestamp: {
    marginRight: spacing.xs,
  },
  receivedTimestamp: {
    marginLeft: spacing.xs,
  },
});
