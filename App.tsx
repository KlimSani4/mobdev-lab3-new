/**
 * App.tsx - Главный компонент приложения "Соседи+"
 *
 * Этот файл является точкой входа приложения и отвечает за:
 * - Настройку навигации (Stack + Bottom Tabs)
 * - Конфигурацию провайдеров (SafeArea, Navigation, Auth)
 * - Обработку глобальных ошибок через ErrorBoundary
 * - Авторизацию пользователя
 *
 * Архитектура навигации:
 * - Stack.Navigator (корневой) содержит Auth, MainTabs и TaskDetail
 * - Tab.Navigator (MainTabs) содержит 4 вкладки: Задачи, Дом, Создать, Профиль
 */

import React, { useRef, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, ActivityIndicator, View, Animated, StyleSheet, Platform } from 'react-native';
import type { RootStackParamList, MainTabParamList } from './src/types';
import { colors, shadows } from './src/utils/theme';

// Web-specific global styles fix
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    * {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1E293B;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    input, textarea, select, button {
      font-family: inherit;
      font-size: inherit;
      color: inherit;
    }
    input::placeholder, textarea::placeholder {
      color: #94A3B8;
    }
    /* Ensure all text is visible */
    div, span, p, h1, h2, h3, h4, h5, h6 {
      color: inherit;
    }
  `;
  document.head.appendChild(style);
}

// Custom navigation theme
const NavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text.primary,
    border: colors.border,
    notification: colors.secondary,
  },
};
import {
  TaskListScreen,
  TaskDetailScreen,
  ProfileScreen,
  CreateTaskScreen,
  AuthScreen,
  BuildingScreen,
  ChatListScreen,
  ChatScreen,
} from './src/screens';
import { ErrorBoundary, LoginPrompt } from './src/components';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';

// Создание навигаторов с типизацией параметров
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

/**
 * AnimatedTabIcon - иконка вкладки с анимацией при активации
 *
 * Эффекты:
 * - Scale up при активации
 * - Spring анимация для естественного ощущения
 */
function AnimatedTabIcon({ icon, focused }: { icon: string; color: string; focused: boolean }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.1 : 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: focused ? 8 : 4,
    }).start();
  }, [focused, scaleAnim]);

  return (
    <Animated.Text
      style={{
        fontSize: 20,
        transform: [{ scale: scaleAnim }],
      }}
    >
      {icon}
    </Animated.Text>
  );
}

/**
 * FadeScreen - обертка для экранов с fade анимацией
 *
 * При переключении вкладки экран плавно появляется (fade in)
 */
function FadeScreen({ children, isFocused }: { children: React.ReactNode; isFocused: boolean }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isFocused ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isFocused, fadeAnim]);

  return (
    <Animated.View style={[tabStyles.fadeContainer, { opacity: fadeAnim }]}>
      {children}
    </Animated.View>
  );
}

/**
 * MainTabs - компонент нижней навигации с анимациями
 *
 * Анимации:
 * 1. Fade transition при переключении экранов
 * 2. Scale animation на иконках при активации
 * 3. Плавный переход цветов
 */
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
        },
        headerStyle: { backgroundColor: colors.primary },
        headerTintColor: colors.text.inverse,
        headerTitleStyle: { fontWeight: '600' },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarShowLabel: true,
        animation: 'shift',
      }}
    >
      <Tab.Screen
        name="TaskList"
        component={TaskListScreen}
        options={{
          title: 'Задачи',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon icon="📋" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Building"
        component={BuildingScreen}
        options={{
          title: 'Дом',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon icon="🏠" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="CreateTask"
        component={CreateTaskScreen}
        options={{
          title: 'Создать',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon icon="➕" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ChatList"
        component={ChatListScreen}
        options={{
          title: 'Чаты',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon icon="💬" color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Профиль',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon icon="👤" color={color} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  fadeContainer: {
    flex: 1,
  },
});

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  text: {
    marginTop: 16,
    color: colors.text.secondary,
    fontSize: 16,
  },
});

/**
 * AppNavigator - навигация приложения
 *
 * Гостевой режим: приложение доступно без авторизации.
 * Пользователи могут просматривать задачи свободно.
 * Авторизация требуется только при создании задачи, отклике или просмотре профиля.
 * Модальное окно LoginPrompt показывается когда требуется авторизация.
 */
function AppNavigator() {
  const { loading } = useAuth();

  // Показываем загрузку пока проверяем авторизацию
  if (loading) {
    return (
      <View style={loadingStyles.container}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={loadingStyles.text}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <>
      <NavigationContainer theme={NavigationTheme}>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.text.inverse,
            headerTitleStyle: { fontWeight: '600' },
            // Плавные переходы между экранами стека
            animation: 'fade_from_bottom',
            animationDuration: 250,
          }}
        >
          {/* Основное приложение доступно всем (гостевой режим) */}
          <Stack.Screen
            name="MainTabs"
            component={MainTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="TaskDetail"
            component={TaskDetailScreen}
            options={{ title: 'Детали задачи' }}
          />
          <Stack.Screen
            name="Chat"
            component={ChatScreen}
            options={({ route }) => ({
              title: route.params.recipientName,
            })}
          />
          {/* Auth экран доступен для навигации если нужен полный экран входа */}
          <Stack.Screen
            name="Auth"
            component={AuthScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      {/* Модальное окно авторизации для ленивой аутентификации */}
      <LoginPrompt />
    </>
  );
}

/**
 * App - корневой компонент приложения
 *
 * Структура провайдеров (снаружи внутрь):
 * 1. ErrorBoundary - перехватывает ошибки рендеринга
 * 2. SafeAreaProvider - безопасные отступы для notch/home indicator
 * 3. AuthProvider - контекст авторизации
 * 4. AppNavigator - навигация приложения
 */
export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <AppNavigator />
          <StatusBar style="light" />
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
