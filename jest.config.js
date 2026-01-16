/**
 * Jest Configuration для React Native Expo проекта
 *
 * Jest - это фреймворк для тестирования JavaScript/TypeScript кода.
 * Конфигурация настроена для работы с Expo и React Native.
 */
module.exports = {
  // Используем preset от jest-expo для корректной работы с Expo
  preset: 'jest-expo',

  // Среда выполнения тестов
  testEnvironment: 'node',

  // Расширения файлов для поиска тестов
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

  // Паттерны для игнорирования при трансформации
  // Нужно явно указать пакеты React Native для транспиляции
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],

  // Настройка путей для модулей
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Файлы для запуска перед тестами
  setupFiles: ['<rootDir>/src/__mocks__/react-native.js'],

  // Паттерны для поиска тестовых файлов
  testMatch: [
    '**/__tests__/**/*.test.[jt]s?(x)',
    '**/?(*.)+(spec|test).[jt]s?(x)',
  ],

  // Сбор информации о покрытии кода
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/__mocks__/**',
  ],

  // Порог покрытия кода (warnings если ниже)
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },

  // Verbose output для детального вывода
  verbose: true,
};
