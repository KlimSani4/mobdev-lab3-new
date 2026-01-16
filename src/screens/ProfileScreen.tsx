/**
 * ProfileScreen - экран профиля пользователя
 *
 * Современный дизайн с:
 * - Градиентной рамкой аватара
 * - Карточками статистики
 * - Секцией достижений
 * - Прогресс-баром кармы
 */
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import { useImagePicker } from '../hooks';
import { updateUserProfile } from '../api/users';
import { formatPhone } from '../utils/helpers';
import { KARMA_THRESHOLDS } from '../utils/constants';
import { colors, spacing, borderRadius, shadows } from '../utils/theme';

// Achievement badges configuration
const ACHIEVEMENTS = [
  { id: 'first_task', icon: '🎯', title: 'Первая задача', description: 'Создана первая задача' },
  { id: 'helper', icon: '🤝', title: 'Помощник', description: 'Помог 5 соседям' },
  { id: 'popular', icon: '⭐', title: 'Популярный', description: 'Получено 10 откликов' },
  { id: 'veteran', icon: '🏆', title: 'Ветеран', description: 'В сообществе 30 дней' },
];

export function ProfileScreen() {
  const { user, logout, refreshUser, loading, isGuest, requireAuth } = useAuth();
  const { imageUri, showPicker } = useImagePicker(user?.avatar ?? undefined);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [saving, setSaving] = useState(false);

  // Показываем загрузку только если идёт проверка авторизации
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Загрузка профиля...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Если пользователь не авторизован - показываем экран приглашения войти
  if (isGuest || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.guestContainer}>
          <View style={styles.guestAvatarWrapper}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.guestAvatarGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.guestAvatarInner}>
                <Text style={styles.guestAvatarText}>?</Text>
              </View>
            </LinearGradient>
          </View>
          <Text style={styles.guestTitle}>Войдите в аккаунт</Text>
          <Text style={styles.guestSubtitle}>
            Чтобы просматривать профиль, создавать задачи и откликаться на
            просьбы соседей
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={requireAuth}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.loginButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.loginButtonText}>Войти или зарегистрироваться</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const startEditing = () => {
    setEditName(user.name);
    setEditPhone(user.phone);
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
      await updateUserProfile(user.id, {
        name: editName.trim(),
        phone: editPhone.trim(),
        avatar: imageUri ?? undefined,
      });
      await refreshUser();
      setIsEditing(false);
      Alert.alert('Успех', 'Профиль обновлён');
    } catch {
      Alert.alert('Ошибка', 'Не удалось сохранить профиль');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const getProgressInfo = () => {
    const karma = user.karma;
    let nextThreshold: number;
    let nextLevel: string;
    let prevThreshold: number = 0;

    if (karma < KARMA_THRESHOLDS.NEIGHBOR) {
      prevThreshold = 0;
      nextThreshold = KARMA_THRESHOLDS.NEIGHBOR;
      nextLevel = 'Сосед';
    } else if (karma < KARMA_THRESHOLDS.HELPER) {
      prevThreshold = KARMA_THRESHOLDS.NEIGHBOR;
      nextThreshold = KARMA_THRESHOLDS.HELPER;
      nextLevel = 'Добряк';
    } else if (karma < KARMA_THRESHOLDS.LEGEND) {
      prevThreshold = KARMA_THRESHOLDS.HELPER;
      nextThreshold = KARMA_THRESHOLDS.LEGEND;
      nextLevel = 'Легенда подъезда';
    } else {
      return null;
    }

    const progress = ((karma - prevThreshold) / (nextThreshold - prevThreshold)) * 100;
    const remaining = nextThreshold - karma;

    return { nextLevel, progress, remaining };
  };

  const progressInfo = getProgressInfo();
  const avatarUri = imageUri || user.avatar;

  // Stats data
  const tasksCreated = user._count?.tasks ?? 0;
  const tasksHelped = user._count?.responses ?? 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar Section with Gradient Border */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={isEditing ? showPicker : undefined}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.avatarGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.avatarInner}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>
                    {user.name.charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>
            </LinearGradient>
            {isEditing && (
              <View style={styles.editBadge}>
                <Text style={styles.editBadgeText}>📷</Text>
              </View>
            )}
          </TouchableOpacity>

          <Text style={styles.userName}>{user.name}</Text>

          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{user.level}</Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{tasksCreated}</Text>
            <Text style={styles.statLabel}>Создано задач</Text>
          </View>

          <View style={[styles.statCard, styles.statCardPrimary]}>
            <Text style={styles.statValueKarma}>{user.karma}</Text>
            <Text style={styles.statLabelKarma}>Карма</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{tasksHelped}</Text>
            <Text style={styles.statLabel}>Помог раз</Text>
          </View>
        </View>

        {/* Progress Section */}
        {progressInfo && (
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Прогресс</Text>
              <Text style={styles.progressRemaining}>
                {progressInfo.remaining} до «{progressInfo.nextLevel}»
              </Text>
            </View>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[colors.primary, colors.secondary]}
                style={[styles.progressFill, { width: `${Math.min(progressInfo.progress, 100)}%` }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </View>
          </View>
        )}

        {/* Achievements Section */}
        <View style={styles.achievementsSection}>
          <Text style={styles.sectionTitle}>Достижения</Text>
          <View style={styles.achievementsGrid}>
            {ACHIEVEMENTS.map((achievement, index) => {
              const isUnlocked = index < 2; // Mock: first 2 unlocked
              return (
                <View
                  key={achievement.id}
                  style={[styles.achievementCard, !isUnlocked && styles.achievementLocked]}
                >
                  <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                  <Text style={[styles.achievementTitle, !isUnlocked && styles.achievementTitleLocked]}>
                    {achievement.title}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Edit Form or Info Display */}
        {isEditing ? (
          <View style={styles.form}>
            <Text style={styles.label}>Имя</Text>
            <TextInput
              style={styles.input}
              value={editName}
              onChangeText={setEditName}
              placeholder="Введите имя"
              placeholderTextColor={colors.text.tertiary}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Телефон</Text>
            <TextInput
              style={styles.input}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="+7-XXX-XXX-XX-XX"
              placeholderTextColor={colors.text.tertiary}
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
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>👤</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Имя</Text>
                  <Text style={styles.infoValue}>{user.name}</Text>
                </View>
              </View>

              <View style={styles.infoDivider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📞</Text>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Телефон</Text>
                  <Text style={styles.infoValue}>{formatPhone(user.phone)}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.editButton} onPress={startEditing}>
              <Text style={styles.editButtonText}>Редактировать профиль</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Выйти из аккаунта</Text>
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
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.lg,
    fontSize: 16,
    color: colors.text.secondary,
  },
  content: {
    padding: spacing.xl,
  },

  // Avatar Section
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
    ...shadows.medium,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 56,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 48,
    color: colors.primary,
    fontWeight: '700',
  },
  editBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: colors.surface,
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },
  editBadgeText: {
    fontSize: 18,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: spacing.lg,
  },
  levelBadge: {
    backgroundColor: `${colors.primary}15`,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },

  // Stats Section
  statsContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.small,
  },
  statCardPrimary: {
    backgroundColor: colors.primary,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
  },
  statValueKarma: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.inverse,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  statLabelKarma: {
    fontSize: 12,
    color: colors.text.inverse,
    marginTop: spacing.xs,
    opacity: 0.9,
  },

  // Progress Section
  progressSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.small,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  progressRemaining: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.divider,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },

  // Achievements Section
  achievementsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  achievementCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.small,
  },
  achievementLocked: {
    opacity: 0.5,
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },
  achievementTitleLocked: {
    color: colors.text.tertiary,
  },

  // Form Styles
  form: {
    marginTop: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surfaceSecondary,
  },
  cancelButtonText: {
    color: colors.text.secondary,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },

  // Info Display Styles
  info: {},
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.small,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.sm,
    marginLeft: 40,
  },
  editButton: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  editButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '500',
  },

  // Guest State Styles
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  guestAvatarWrapper: {
    marginBottom: spacing.xl,
  },
  guestAvatarGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    padding: 4,
    ...shadows.medium,
  },
  guestAvatarInner: {
    flex: 1,
    borderRadius: 56,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guestAvatarText: {
    fontSize: 48,
    color: colors.text.tertiary,
    fontWeight: '700',
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  loginButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  loginButtonGradient: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  loginButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },
});
