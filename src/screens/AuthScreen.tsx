/**
 * AuthScreen.tsx - Экран авторизации/регистрации
 *
 * Позволяет пользователю войти или зарегистрироваться.
 * Переключение между режимами входа и регистрации.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

export function AuthScreen() {
  // Режим: вход или регистрация
  const [isLogin, setIsLogin] = useState(true);

  // Поля формы
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  // Состояние загрузки
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();

  // Обработка отправки формы
  const handleSubmit = async () => {
    // Валидация
    if (!phone.trim()) {
      Alert.alert('Ошибка', 'Введите номер телефона');
      return;
    }
    if (!isLogin && !name.trim()) {
      Alert.alert('Ошибка', 'Введите ваше имя');
      return;
    }
    if (!password.trim() || password.length < 6) {
      Alert.alert('Ошибка', 'Пароль должен быть минимум 6 символов');
      return;
    }

    setSubmitting(true);
    try {
      if (isLogin) {
        await login(phone, password);
      } else {
        await register(phone, name, password);
      }
    } catch (e) {
      Alert.alert('Ошибка', e instanceof Error ? e.message : 'Что-то пошло не так');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Логотип и заголовок */}
        <View style={styles.header}>
          <Text style={styles.logo}>🏠</Text>
          <Text style={styles.title}>Соседи+</Text>
          <Text style={styles.subtitle}>
            {isLogin ? 'Войдите в аккаунт' : 'Создайте аккаунт'}
          </Text>
        </View>

        {/* Форма */}
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Номер телефона"
            placeholderTextColor="#999"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoCapitalize="none"
          />

          {!isLogin && (
            <TextInput
              style={styles.input}
              placeholder="Ваше имя"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />
          )}

          <TextInput
            style={styles.input}
            placeholder="Пароль"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {/* Кнопка отправки */}
          <TouchableOpacity
            style={[styles.button, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>
                {isLogin ? 'Войти' : 'Зарегистрироваться'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Переключение режима */}
        <TouchableOpacity
          style={styles.switchMode}
          onPress={() => setIsLogin(!isLogin)}
        >
          <Text style={styles.switchText}>
            {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
            <Text style={styles.switchLink}>
              {isLogin ? 'Зарегистрируйтесь' : 'Войдите'}
            </Text>
          </Text>
        </TouchableOpacity>

        {/* Демо вход */}
        <TouchableOpacity
          style={styles.demoButton}
          onPress={async () => {
            setPhone('+79991234567');
            setPassword('password');
            setIsLogin(true);
          }}
        >
          <Text style={styles.demoText}>Демо: +79991234567 / password</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#6200EE',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    gap: 16,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  button: {
    backgroundColor: '#6200EE',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  switchMode: {
    marginTop: 24,
    alignItems: 'center',
  },
  switchText: {
    fontSize: 14,
    color: '#666',
  },
  switchLink: {
    color: '#6200EE',
    fontWeight: '600',
  },
  demoButton: {
    marginTop: 16,
    alignItems: 'center',
    padding: 12,
  },
  demoText: {
    fontSize: 12,
    color: '#999',
  },
});
