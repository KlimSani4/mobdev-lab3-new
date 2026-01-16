/**
 * BuildingScreen - экран "Мой дом" с информацией о здании
 *
 * Современный дизайн с:
 * - Заголовком с адресом дома
 * - Статистикой (соседи в приложении, активные задачи)
 * - Полезными контактами (УК, аварийная служба, участковый)
 * - Правилами дома
 * - Кнопкой приглашения соседей
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, shadows } from '../utils/theme';

// Контактные данные дома
const CONTACTS = [
  {
    id: 'management',
    icon: '🏢',
    title: 'Управляющая компания',
    subtitle: 'ООО "Комфорт-Сервис"',
    phone: '+7-495-123-45-67',
  },
  {
    id: 'emergency',
    icon: '🚨',
    title: 'Аварийная служба',
    subtitle: 'Круглосуточно',
    phone: '112',
  },
  {
    id: 'police',
    icon: '👮',
    title: 'Участковый',
    subtitle: 'Иванов А.П.',
    phone: '+7-495-987-65-43',
  },
];

// Правила дома
const BUILDING_RULES = [
  { id: '1', icon: '🔇', text: 'Тишина с 23:00 до 7:00' },
  { id: '2', icon: '🚭', text: 'Курение в подъезде запрещено' },
  { id: '3', icon: '🐕', text: 'Выгул собак только на поводке' },
  { id: '4', icon: '🚗', text: 'Парковка только на размеченных местах' },
];

export function BuildingScreen() {
  // Функция для звонка по номеру
  const handleCall = (phone: string, title: string) => {
    const phoneUrl = `tel:${phone.replace(/[^0-9+]/g, '')}`;

    Alert.alert(
      'Позвонить',
      `${title}\n${phone}`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Позвонить',
          onPress: () => {
            Linking.openURL(phoneUrl).catch(() => {
              Alert.alert('Ошибка', 'Не удалось открыть приложение для звонков');
            });
          },
        },
      ]
    );
  };

  // Функция для приглашения соседей
  const handleInvite = async () => {
    try {
      const result = await Share.share({
        message: 'Присоединяйся к приложению "Соседи+"! Здесь мы помогаем друг другу и общаемся. Скачать: https://sosedi-plus.app/invite/building123',
        title: 'Приглашение в Соседи+',
      });

      if (result.action === Share.sharedAction) {
        Alert.alert('Отлично!', 'Приглашение отправлено');
      }
    } catch {
      Alert.alert('Ошибка', 'Не удалось поделиться приглашением');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section with Building Info */}
        <View style={styles.headerSection}>
          <LinearGradient
            colors={[colors.primary, colors.primaryDark]}
            style={styles.headerGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.buildingIconWrapper}>
              <Text style={styles.buildingIcon}>🏠</Text>
            </View>
            <Text style={styles.buildingName}>Жилой комплекс "Солнечный"</Text>
            <Text style={styles.buildingAddress}>ул. Примерная, д. 42</Text>
          </LinearGradient>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>👥</Text>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>соседей в приложении</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statIcon}>📋</Text>
            <Text style={styles.statValue}>5</Text>
            <Text style={styles.statLabel}>активных задач</Text>
          </View>
        </View>

        {/* Contacts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Полезные контакты</Text>
          <View style={styles.contactsCard}>
            {CONTACTS.map((contact, index) => (
              <React.Fragment key={contact.id}>
                <TouchableOpacity
                  style={styles.contactRow}
                  onPress={() => handleCall(contact.phone, contact.title)}
                  activeOpacity={0.7}
                >
                  <View style={styles.contactIconWrapper}>
                    <Text style={styles.contactIcon}>{contact.icon}</Text>
                  </View>
                  <View style={styles.contactInfo}>
                    <Text style={styles.contactTitle}>{contact.title}</Text>
                    <Text style={styles.contactSubtitle}>{contact.subtitle}</Text>
                  </View>
                  <View style={styles.contactPhoneWrapper}>
                    <Text style={styles.contactPhone}>{contact.phone}</Text>
                    <Text style={styles.callIcon}>📞</Text>
                  </View>
                </TouchableOpacity>
                {index < CONTACTS.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Building Rules Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Правила дома</Text>
          <View style={styles.rulesCard}>
            {BUILDING_RULES.map((rule) => (
              <View key={rule.id} style={styles.ruleRow}>
                <Text style={styles.ruleIcon}>{rule.icon}</Text>
                <Text style={styles.ruleText}>{rule.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Building Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Информация о доме</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🏗️</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Год постройки</Text>
                <Text style={styles.infoValue}>2018</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🔢</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Этажей</Text>
                <Text style={styles.infoValue}>17</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🚪</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Квартир</Text>
                <Text style={styles.infoValue}>136</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Invite Button */}
        <TouchableOpacity
          style={styles.inviteButton}
          onPress={handleInvite}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.inviteButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.inviteButtonIcon}>✉️</Text>
            <Text style={styles.inviteButtonText}>Пригласить соседей</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Bottom spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
  },

  // Header Section
  headerSection: {
    marginBottom: spacing.xl,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.large,
  },
  headerGradient: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  buildingIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  buildingIcon: {
    fontSize: 40,
  },
  buildingName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.inverse,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  buildingAddress: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
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
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.card,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

  // Section Styles
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },

  // Contacts Section
  contactsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  contactIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: `${colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  contactIcon: {
    fontSize: 22,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  contactSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  contactPhoneWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  contactPhone: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  callIcon: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginLeft: 60,
  },

  // Rules Section
  rulesCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  ruleIcon: {
    fontSize: 20,
    marginRight: spacing.md,
    width: 28,
    textAlign: 'center',
  },
  ruleText: {
    fontSize: 15,
    color: colors.text.primary,
    flex: 1,
  },

  // Info Section
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.card,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  infoIcon: {
    fontSize: 22,
    marginRight: spacing.md,
    width: 32,
    textAlign: 'center',
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

  // Invite Button
  inviteButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.medium,
  },
  inviteButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  inviteButtonIcon: {
    fontSize: 20,
  },
  inviteButtonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '600',
  },

  bottomSpacing: {
    height: spacing.xl,
  },
});
