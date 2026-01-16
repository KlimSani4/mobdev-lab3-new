/**
 * ChatScreen - экран чата с отдельным соседом
 *
 * Демонстрирует:
 * - FlatList для отображения сообщений (инвертированный)
 * - Компонент ChatBubble для пузырей сообщений
 * - Поле ввода сообщения с кнопкой отправки
 * - Моковые сообщения для демонстрации
 * - KeyboardAvoidingView для iOS
 */
import React, { useState, useRef } from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { ChatBubble, ChatMessage } from '../components/ChatBubble';
import { colors, spacing, borderRadius, shadows } from '../utils/theme';

// Типизация props с навигацией и параметрами
type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

// Моковые сообщения для демонстрации
const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  '1': [
    {
      id: 'm1',
      text: 'Здравствуйте! Я видела вашу задачу про доставку продуктов.',
      timestamp: '2025-01-14T14:00:00Z',
      isSent: false,
    },
    {
      id: 'm2',
      text: 'Добрый день! Да, мне нужна помощь с доставкой из магазина.',
      timestamp: '2025-01-14T14:05:00Z',
      isSent: true,
    },
    {
      id: 'm3',
      text: 'Могу помочь сегодня после 17:00. Вам подходит?',
      timestamp: '2025-01-14T14:10:00Z',
      isSent: false,
    },
    {
      id: 'm4',
      text: 'Отлично! Это было бы замечательно. Я подготовлю список.',
      timestamp: '2025-01-14T14:15:00Z',
      isSent: true,
    },
    {
      id: 'm5',
      text: 'Хорошо, напишите когда будете готовы!',
      timestamp: '2025-01-14T14:20:00Z',
      isSent: false,
    },
    {
      id: 'm6',
      text: 'Спасибо за помощь с доставкой! Вы настоящий сосед-помощник',
      timestamp: '2025-01-14T14:30:00Z',
      isSent: false,
    },
  ],
  '2': [
    {
      id: 'm1',
      text: 'Привет! Вы оставляли ключи для полива цветов?',
      timestamp: '2025-01-14T10:00:00Z',
      isSent: true,
    },
    {
      id: 'm2',
      text: 'Да, всё верно! Спасибо что согласились помочь.',
      timestamp: '2025-01-14T10:30:00Z',
      isSent: false,
    },
    {
      id: 'm3',
      text: 'Когда вам удобно забрать ключи?',
      timestamp: '2025-01-14T12:15:00Z',
      isSent: false,
    },
  ],
  '3': [
    {
      id: 'm1',
      text: 'Здравствуйте! Могу помочь с выгулом собаки.',
      timestamp: '2025-01-13T17:00:00Z',
      isSent: true,
    },
    {
      id: 'm2',
      text: 'Отлично! Когда вам удобно?',
      timestamp: '2025-01-13T17:30:00Z',
      isSent: false,
    },
    {
      id: 'm3',
      text: 'Могу в 18:00 сегодня.',
      timestamp: '2025-01-13T18:00:00Z',
      isSent: true,
    },
    {
      id: 'm4',
      text: 'Договорились! Буду ждать в 18:00',
      timestamp: '2025-01-13T18:45:00Z',
      isSent: false,
    },
  ],
  '4': [
    {
      id: 'm1',
      text: 'Привет! Видел что нужна помощь с собакой.',
      timestamp: '2025-01-12T09:00:00Z',
      isSent: false,
    },
    {
      id: 'm2',
      text: 'Да, можете помочь завтра?',
      timestamp: '2025-01-12T09:30:00Z',
      isSent: true,
    },
    {
      id: 'm3',
      text: 'Да, могу помочь с выгулом собаки завтра',
      timestamp: '2025-01-12T10:00:00Z',
      isSent: false,
    },
  ],
};

// Дефолтные сообщения если чат не найден
const DEFAULT_MESSAGES: ChatMessage[] = [
  {
    id: 'default1',
    text: 'Привет! Как дела?',
    timestamp: new Date().toISOString(),
    isSent: false,
  },
];

export function ChatScreen({ route }: Props) {
  const { chatId, recipientId, recipientName, taskId, taskTitle } = route.params;

  // Получаем сообщения для данного чата
  // Используем recipientId как ключ если chatId не указан
  const chatKey = chatId || recipientId;
  const initialMessages = MOCK_MESSAGES[chatKey] || DEFAULT_MESSAGES;

  // Состояние сообщений (для демо добавления новых)
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);

  // Состояние поля ввода
  const [inputText, setInputText] = useState('');

  // Ссылка на FlatList для прокрутки
  const flatListRef = useRef<FlatList>(null);

  /**
   * Отправка нового сообщения
   */
  const handleSend = () => {
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: `new_${Date.now()}`,
      text: inputText.trim(),
      timestamp: new Date().toISOString(),
      isSent: true,
    };

    setMessages(prev => [...prev, newMessage]);
    setInputText('');

    // Прокрутка к последнему сообщению
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  /**
   * Рендер сообщения
   */
  const renderMessage = ({ item }: { item: ChatMessage }) => (
    <ChatBubble message={item} />
  );

  /**
   * Получает инициалы из имени для аватара
   */
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  /**
   * Генерирует цвет аватара на основе имени
   */
  const getAvatarColor = (name: string): string => {
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
  };

  const initials = getInitials(recipientName);
  const avatarColor = getAvatarColor(recipientName);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Заголовок с информацией о собеседнике */}
        <View style={styles.recipientHeader}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.recipientInfo}>
            <Text style={styles.recipientName}>{recipientName}</Text>
            <Text style={styles.recipientStatus}>Сосед</Text>
          </View>
        </View>

        {/* Контекст задачи */}
        {taskTitle && (
          <View style={styles.taskContext}>
            <Text style={styles.taskContextLabel}>📋 Задача:</Text>
            <Text style={styles.taskContextTitle} numberOfLines={1}>{taskTitle}</Text>
          </View>
        )}

        {/* Список сообщений */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Поле ввода сообщения */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Написать сообщение..."
            placeholderTextColor={colors.text.tertiary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>Отправить</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  recipientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.inverse,
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  recipientStatus: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  taskContext: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight + '15',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: spacing.sm,
  },
  taskContextLabel: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  taskContextTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary,
  },
  messagesList: {
    paddingVertical: spacing.md,
    flexGrow: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.text.primary,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.text.disabled,
  },
  sendButtonText: {
    color: colors.text.inverse,
    fontSize: 14,
    fontWeight: '600',
  },
});
