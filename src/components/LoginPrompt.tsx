/**
 * LoginPrompt.tsx - Модальное окно авторизации
 *
 * Показывается когда гостевой пользователь пытается выполнить
 * действие, требующее авторизации (создание задачи, отклик, профиль).
 *
 * Содержит формы входа и регистрации с переключением между ними.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export function LoginPrompt() {
  const { showLoginPrompt, setShowLoginPrompt, login, register, loading, error } = useAuth();

  // Режим: 'login' или 'register'
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Поля формы
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Сброс формы при закрытии
  const handleClose = () => {
    setShowLoginPrompt(false);
    setPhone('');
    setName('');
    setPassword('');
    setLocalError(null);
    setMode('login');
  };

  // Обработка входа
  const handleLogin = async () => {
    if (!phone.trim() || !password.trim()) {
      setLocalError('Заполните все поля');
      return;
    }

    try {
      setLocalError(null);
      await login(phone.trim(), password);
      handleClose();
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Ошибка входа');
    }
  };

  // Обработка регистрации
  const handleRegister = async () => {
    if (!phone.trim() || !name.trim() || !password.trim()) {
      setLocalError('Заполните все поля');
      return;
    }

    if (password.length < 4) {
      setLocalError('Пароль должен быть не менее 4 символов');
      return;
    }

    try {
      setLocalError(null);
      await register(phone.trim(), name.trim(), password);
      handleClose();
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Ошибка регистрации');
    }
  };

  // Переключение между режимами
  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setLocalError(null);
  };

  const displayError = localError || error;

  return (
    <Modal
      visible={showLoginPrompt}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalContainer}>
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Заголовок */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {mode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
              </Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>

            {/* Подзаголовок */}
            <Text style={styles.subtitle}>
              {mode === 'login'
                ? 'Войдите, чтобы создавать задачи и откликаться'
                : 'Создайте аккаунт, чтобы начать помогать соседям'}
            </Text>

            {/* Ошибка */}
            {displayError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{displayError}</Text>
              </View>
            )}

            {/* Форма */}
            <View style={styles.form}>
              <Text style={styles.label}>Телефон</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="+7-XXX-XXX-XX-XX"
                keyboardType="phone-pad"
                autoCapitalize="none"
                editable={!loading}
              />

              {mode === 'register' && (
                <>
                  <Text style={styles.label}>Имя</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Ваше имя"
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </>
              )}

              <Text style={styles.label}>Пароль</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Введите пароль"
                secureTextEntry
                editable={!loading}
              />

              {/* Кнопка действия */}
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={mode === 'login' ? handleLogin : handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.submitButtonText}>
                    {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Переключение режима */}
              <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
                <Text style={styles.toggleText}>
                  {mode === 'login'
                    ? 'Нет аккаунта? Зарегистрируйтесь'
                    : 'Уже есть аккаунт? Войти'}
                </Text>
              </TouchableOpacity>

              {/* Кнопка продолжить как гость */}
              <TouchableOpacity style={styles.guestButton} onPress={handleClose}>
                <Text style={styles.guestButtonText}>Продолжить как гость</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  scrollContent: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
  },
  form: {},
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  toggleButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  toggleText: {
    color: '#6200EE',
    fontSize: 14,
  },
  guestButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  guestButtonText: {
    color: '#999',
    fontSize: 14,
  },
});
