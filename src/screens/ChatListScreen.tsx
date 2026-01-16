/**
 * ChatListScreen - экран со списком чатов с соседями
 *
 * Демонстрирует:
 * - FlatList для отображения списка чатов
 * - Аватары пользователей с индикаторами непрочитанных сообщений
 * - Превью последнего сообщения и время
 * - Пустое состояние когда нет чатов
 * - Навигация к экрану чата при нажатии
 */
import React from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { EmptyState } from '../components';
import { colors, spacing, borderRadius, shadows } from '../utils/theme';

// Тип для чата в списке
export interface ChatPreview {
  id: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

// Типизация props с навигацией
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

// Моковые данные чатов для демонстрации
const MOCK_CHATS: ChatPreview[] = [
  {
    id: '1',
    recipientId: 'user1',
    recipientName: 'Анна Петрова',
    recipientAvatar: undefined,
    lastMessage: 'Спасибо за помощь с доставкой! Вы настоящий сосед-помощник',
    lastMessageTime: '2025-01-14T14:30:00Z',
    unreadCount: 2,
  },
  {
    id: '2',
    recipientId: 'user2',
    recipientName: 'Михаил Сидоров',
    recipientAvatar: undefined,
    lastMessage: 'Когда вам удобно забрать ключи?',
    lastMessageTime: '2025-01-14T12:15:00Z',
    unreadCount: 0,
  },
  {
    id: '3',
    recipientId: 'user3',
    recipientName: 'Елена Козлова',
    recipientAvatar: undefined,
    lastMessage: 'Договорились! Буду ждать в 18:00',
    lastMessageTime: '2025-01-13T18:45:00Z',
    unreadCount: 1,
  },
  {
    id: '4',
    recipientId: 'user4',
    recipientName: 'Дмитрий Волков',
    recipientAvatar: undefined,
    lastMessage: 'Да, могу помочь с выгулом собаки завтра',
    lastMessageTime: '2025-01-12T10:00:00Z',
    unreadCount: 0,
  },
];

/**
 * Форматирует время для отображения в списке чатов
 * - Сегодня: показывает время (14:30)
 * - Вчера: показывает "Вчера"
 * - Раньше: показывает дату (12 янв)
 */
function formatChatTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (messageDate.getTime() === today.getTime()) {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } else if (messageDate.getTime() === yesterday.getTime()) {
    return 'Вчера';
  } else {
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
    });
  }
}

/**
 * Получает инициалы из имени для аватара
 */
function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Генерирует цвет аватара на основе имени
 */
function getAvatarColor(name: string): string {
  const colors_palette = [
    '#6366F1', // primary
    '#EC4899', // secondary
    '#10B981', // success
    '#F59E0B', // warning
    '#3B82F6', // info
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors_palette[Math.abs(hash) % colors_palette.length];
}

export function ChatListScreen({ navigation }: Props) {
  // Для демо используем моковые данные
  // В реальном приложении здесь был бы хук для получения чатов
  const chats = MOCK_CHATS;

  /**
   * Обработчик нажатия на чат
   */
  const handleChatPress = (chat: ChatPreview) => {
    navigation.navigate('Chat', {
      chatId: chat.id,
      recipientId: chat.recipientId,
      recipientName: chat.recipientName,
    });
  };

  /**
   * Рендер элемента списка чатов
   */
  const renderChatItem = ({ item }: { item: ChatPreview }) => {
    const initials = getInitials(item.recipientName);
    const avatarColor = getAvatarColor(item.recipientName);
    const hasUnread = item.unreadCount > 0;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => handleChatPress(item)}
        activeOpacity={0.7}
      >
        {/* Аватар */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          {/* Индикатор непрочитанных */}
          {hasUnread && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {item.unreadCount > 9 ? '9+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>

        {/* Контент чата */}
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={[styles.recipientName, hasUnread && styles.unreadName]} numberOfLines={1}>
              {item.recipientName}
            </Text>
            <Text style={[styles.timeText, hasUnread && styles.unreadTime]}>
              {formatChatTime(item.lastMessageTime)}
            </Text>
          </View>
          <Text
            style={[styles.lastMessage, hasUnread && styles.unreadMessage]}
            numberOfLines={2}
          >
            {item.lastMessage}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Заголовок экрана
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>Сообщения</Text>
      <Text style={styles.headerSubtitle}>Общайтесь с соседями</Text>
    </View>
  );

  // Пустое состояние
  if (chats.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        {renderHeader()}
        <EmptyState
          icon="💬"
          title="Пока нет чатов"
          description="Начните общаться с соседями"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={styles.list}
        ListHeaderComponent={renderHeader}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerContainer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  list: {
    paddingBottom: spacing.xl,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  unreadText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  unreadName: {
    fontWeight: '700',
  },
  timeText: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  unreadTime: {
    color: colors.primary,
    fontWeight: '600',
  },
  lastMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  unreadMessage: {
    color: colors.text.primary,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: 56 + spacing.lg + spacing.md, // avatar width + paddings
  },
});
