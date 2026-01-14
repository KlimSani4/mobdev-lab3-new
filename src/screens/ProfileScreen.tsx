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
import { useUserProfile, useImagePicker } from '../hooks';
import { LoadingState } from '../components';
import { formatPhone, getKarmaLevel } from '../utils/helpers';
import { KARMA_THRESHOLDS } from '../utils/constants';

export function ProfileScreen() {
  const { profile, loading, updateProfile, resetProfile } = useUserProfile();
  const { imageUri, showPicker } = useImagePicker(profile.avatar_url);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const startEditing = () => {
    setEditName(profile.name);
    setEditPhone(profile.phone);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditName('');
    setEditPhone('');
  };

  const saveProfile = async () => {
    if (!editName.trim() || !editPhone.trim()) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        name: editName.trim(),
        phone: editPhone.trim(),
        avatar_url: imageUri,
      });
      setIsEditing(false);
    } catch {
      Alert.alert('Ошибка', 'Не удалось сохранить профиль');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Сброс профиля',
      'Вы уверены? Все данные будут удалены.',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Сбросить',
          style: 'destructive',
          onPress: resetProfile,
        },
      ]
    );
  };

  const getProgressInfo = () => {
    const karma = profile.karma;
    let nextThreshold: number;
    let nextLevel: string;

    if (karma < KARMA_THRESHOLDS.NEIGHBOR) {
      nextThreshold = KARMA_THRESHOLDS.NEIGHBOR;
      nextLevel = 'Сосед';
    } else if (karma < KARMA_THRESHOLDS.HELPER) {
      nextThreshold = KARMA_THRESHOLDS.HELPER;
      nextLevel = 'Добряк';
    } else if (karma < KARMA_THRESHOLDS.LEGEND) {
      nextThreshold = KARMA_THRESHOLDS.LEGEND;
      nextLevel = 'Легенда подъезда';
    } else {
      return null;
    }

    const progress = (karma / nextThreshold) * 100;
    const remaining = nextThreshold - karma;

    return { nextLevel, progress, remaining };
  };

  if (loading) {
    return <LoadingState message="Загружаем профиль..." />;
  }

  const progressInfo = getProgressInfo();
  const avatarUri = imageUri || profile.avatar_url;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={showPicker}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {profile.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.editBadge}>
              <Text style={styles.editBadgeText}>📷</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.level}>{profile.level}</Text>
        </View>

        {isEditing ? (
          <View style={styles.form}>
            <Text style={styles.label}>Имя</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Введите имя"
              autoCapitalize="words"
            />

            <Text style={styles.label}>Телефон</Text>
            <TextInput
              style={styles.input}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="+7-XXX-XXX-XX-XX"
              keyboardType="phone-pad"
            />

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={cancelEditing}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={saveProfile}
                disabled={saving}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? 'Сохранение...' : 'Сохранить'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.info}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Имя</Text>
              <Text style={styles.infoValue}>{profile.name}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Телефон</Text>
              <Text style={styles.infoValue}>{formatPhone(profile.phone)}</Text>
            </View>

            <View style={styles.karmaBlock}>
              <Text style={styles.karmaLabel}>Карма</Text>
              <Text style={styles.karmaValue}>{profile.karma}</Text>
            </View>

            {progressInfo && (
              <View style={styles.progressBlock}>
                <Text style={styles.progressText}>
                  До уровня «{progressInfo.nextLevel}» осталось{' '}
                  {progressInfo.remaining} кармы
                </Text>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(progressInfo.progress, 100)}%` },
                    ]}
                  />
                </View>
              </View>
            )}

            <TouchableOpacity style={styles.editButton} onPress={startEditing}>
              <Text style={styles.editButtonText}>Редактировать</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Сбросить профиль</Text>
            </TouchableOpacity>
          </View>
        )}
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#6200EE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarText: {
    fontSize: 40,
    color: '#FFF',
    fontWeight: '600',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  editBadgeText: {
    fontSize: 16,
  },
  level: {
    fontSize: 18,
    color: '#6200EE',
    fontWeight: '600',
    marginTop: 12,
  },
  form: {
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#6200EE',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  info: {},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  karmaBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  karmaLabel: {
    fontSize: 16,
    color: '#666',
  },
  karmaValue: {
    fontSize: 24,
    color: '#6200EE',
    fontWeight: '700',
  },
  progressBlock: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#DDD',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6200EE',
    borderRadius: 4,
  },
  editButton: {
    marginTop: 24,
    backgroundColor: '#6200EE',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  resetButton: {
    marginTop: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#F44336',
    fontSize: 14,
  },
});
