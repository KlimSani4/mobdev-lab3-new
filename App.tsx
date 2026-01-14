import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import type { RootStackParamList, MainTabParamList } from './src/types';
import {
  TaskListScreen,
  TaskDetailScreen,
  ProfileScreen,
  CreateTaskScreen,
} from './src/screens';
import { ErrorBoundary } from './src/components';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6200EE',
        tabBarInactiveTintColor: '#999',
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
        headerStyle: { backgroundColor: '#6200EE' },
        headerTintColor: '#FFF',
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="TaskList"
        component={TaskListScreen}
        options={{
          title: 'Задачи',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>📋</Text>
          ),
        }}
      />
      <Tab.Screen
        name="CreateTask"
        component={CreateTaskScreen}
        options={{
          title: 'Создать',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>➕</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Профиль',
          tabBarIcon: ({ color }) => (
            <Text style={{ fontSize: 24, color }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: { backgroundColor: '#6200EE' },
              headerTintColor: '#FFF',
              headerTitleStyle: { fontWeight: '600' },
            }}
          >
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
          </Stack.Navigator>
        </NavigationContainer>
        <StatusBar style="light" />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
