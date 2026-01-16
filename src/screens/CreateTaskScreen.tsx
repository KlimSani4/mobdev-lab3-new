import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  Platform,
} from 'react-native';

// Cross-platform alert
const showAlert = (title: string, message?: string, onOk?: () => void) => {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n\n${message}` : title);
    onOk?.();
  } else {
    Alert.alert(title, message, [{ text: 'OK', onPress: onOk }]);
  }
};
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList, MainTabParamList, TaskCategory, TaskUrgency } from '../types';
import { createTask } from '../api';
import { useImagePicker } from '../hooks';
import { useAuth } from '../contexts/AuthContext';
import { CATEGORY_ICONS, CATEGORY_LABELS, URGENCY_LABELS, URGENCY_COLORS } from '../utils/constants';
import { colors, spacing, borderRadius } from '../utils/theme';

/**
 * Props для CreateTaskScreen
 *
 * Поддерживает навигацию как из Stack Navigator, так и из Tab Navigator.
 * Принимает опциональные параметры initialCategory и initialTitle
 * для предзаполнения формы (например, из QuickActions).
 */
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'CreateTask'>;
  route?: RouteProp<MainTabParamList, 'CreateTask'>;
};

const CATEGORIES: TaskCategory[] = ['repair', 'delivery', 'pets', 'other'];
const URGENCIES: TaskUrgency[] = ['low', 'medium', 'high', 'urgent'];

export function CreateTaskScreen({ navigation, route }: Props) {
  const { user, isGuest, requireAuth } = useAuth();

  // Получаем начальные значения из параметров навигации (если переданы)
  const initialCategory = route?.params?.initialCategory ?? 'other';
  const initialTitle = route?.params?.initialTitle ?? '';

  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>(initialCategory);
  const [urgency, setUrgency] = useState<TaskUrgency>('medium');
  const [reward, setReward] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { imageUri, showPicker, clearImage } = useImagePicker();

  /**
   * Эффект для обновления формы при изменении параметров навигации
   *
   * Это нужно для случая, когда пользователь уже на экране CreateTask
   * и нажимает на другое быстрое действие - форма должна обновиться.
   */
  useEffect(() => {
    if (route?.params?.initialCategory) {
      setCategory(route.params.initialCategory);
    }
    if (route?.params?.initialTitle !== undefined) {
      setTitle(route.params.initialTitle);
    }
  }, [route?.params?.initialCategory, route?.params?.initialTitle]);

  const handleSubmit = async () => {
    // Проверяем авторизацию - если гость, показываем модальное окно входа
    if (!requireAuth()) {
      return;
    }

    if (!title.trim()) {
      showAlert('Ошибка', 'Введите название задачи');
      return;
    }

    if (!description.trim()) {
      showAlert('Ошибка', 'Введите описание задачи');
      return;
    }

    if (!user) {
      // На случай если пользователь закрыл модальное окно
      return;
    }

    try {
      setSubmitting(true);
      await createTask({
        title: title.trim(),
        description: description.trim(),
        category,
        urgency,
        reward: reward ? parseInt(reward, 10) : undefined,
        imageUrl: imageUri ?? undefined,
        authorId: user.id,
      });
      showAlert('Успех', 'Задача создана!', () => {
        // Сбрасываем форму и возвращаемся
        setTitle('');
        setDescription('');
        setCategory('other');
        setUrgency('medium');
        setReward('');
        clearImage();
        navigation.goBack();
      });
    } catch (error) {
      console.error('Create task error:', error);
      showAlert('Ошибка', 'Не удалось создать задачу');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Баннер для гостевого режима */}
        {isGuest && (
          <TouchableOpacity style={styles.guestBanner} onPress={requireAuth}>
            <Text style={styles.guestBannerText}>
              Войдите, чтобы создать задачу
            </Text>
            <Text style={styles.guestBannerLink}>Войти</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.label}>Название</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Что нужно сделать?"
          maxLength={100}
        />

        <Text style={styles.label}>Описание</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Опишите подробнее..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />

        <Text style={styles.label}>Категория</Text>
        <View style={styles.categoryContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && styles.categoryButtonActive,
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text style={styles.categoryIcon}>{CATEGORY_ICONS[cat]}</Text>
              <Text
                style={[
                  styles.categoryText,
                  category === cat && styles.categoryTextActive,
                ]}
              >
                {CATEGORY_LABELS[cat]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Срочность</Text>
        <View style={styles.urgencyContainer}>
          {URGENCIES.map((urg) => (
            <TouchableOpacity
              key={urg}
              style={[
                styles.urgencyButton,
                urgency === urg && { backgroundColor: URGENCY_COLORS[urg] + '20', borderColor: URGENCY_COLORS[urg] },
              ]}
              onPress={() => setUrgency(urg)}
            >
              <View style={[styles.urgencyDot, { backgroundColor: URGENCY_COLORS[urg] }]} />
              <Text
                style={[
                  styles.urgencyText,
                  urgency === urg && { color: URGENCY_COLORS[urg], fontWeight: '600' },
                ]}
              >
                {URGENCY_LABELS[urg]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Вознаграждение (опционально)</Text>
        <View style={styles.rewardContainer}>
          <TextInput
            style={styles.rewardInput}
            value={reward}
            onChangeText={(text) => setReward(text.replace(/[^0-9]/g, ''))}
            placeholder="0"
            keyboardType="numeric"
            maxLength={6}
          />
          <Text style={styles.rewardCurrency}>₽</Text>
        </View>
        <Text style={styles.rewardHint}>
          Укажите сумму, если готовы отблагодарить за помощь
        </Text>

        <Text style={styles.label}>Фото (опционально)</Text>
        {imageUri ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <TouchableOpacity style={styles.removeImage} onPress={clearImage}>
              <Text style={styles.removeImageText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.addImageButton} onPress={showPicker}>
            <Text style={styles.addImageIcon}>📷</Text>
            <Text style={styles.addImageText}>Добавить фото</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? 'Создание...' : 'Создать задачу'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    gap: 6,
  },
  categoryButtonActive: {
    backgroundColor: '#6200EE',
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: 14,
    color: '#666',
  },
  categoryTextActive: {
    color: '#FFF',
    fontWeight: '500',
  },
  urgencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  urgencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  urgencyText: {
    fontSize: 14,
    color: '#666',
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  rewardInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  rewardCurrency: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  rewardHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 6,
  },
  imageContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  removeImage: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderWidth: 2,
    borderColor: '#DDD',
    borderStyle: 'dashed',
    borderRadius: 8,
    gap: 8,
  },
  addImageIcon: {
    fontSize: 24,
  },
  addImageText: {
    fontSize: 16,
    color: '#666',
  },
  submitButton: {
    marginTop: 32,
    backgroundColor: '#6200EE',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  guestBanner: {
    backgroundColor: '#FFF3E0',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  guestBannerText: {
    fontSize: 14,
    color: '#E65100',
    flex: 1,
  },
  guestBannerLink: {
    fontSize: 14,
    color: '#6200EE',
    fontWeight: '600',
    marginLeft: 8,
  },
});
