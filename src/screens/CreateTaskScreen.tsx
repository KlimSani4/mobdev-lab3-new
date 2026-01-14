import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList, TaskCategory } from '../types';
import { createTask } from '../api';
import { useImagePicker } from '../hooks';
import { CATEGORY_ICONS, CATEGORY_LABELS } from '../utils/constants';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const CATEGORIES: TaskCategory[] = ['delivery', 'tools', 'pets', 'other'];

export function CreateTaskScreen({ navigation }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('other');
  const [submitting, setSubmitting] = useState(false);
  const { imageUri, showPicker, clearImage } = useImagePicker();

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Ошибка', 'Введите название задачи');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Ошибка', 'Введите описание задачи');
      return;
    }

    try {
      setSubmitting(true);
      await createTask({
        title: title.trim(),
        description: description.trim(),
        category,
        image_url: imageUri ?? undefined,
      });
      Alert.alert('Успех', 'Задача создана!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Ошибка', 'Не удалось создать задачу');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
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
});
