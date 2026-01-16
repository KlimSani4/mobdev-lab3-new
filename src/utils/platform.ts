/**
 * platform.ts - утилиты для работы с платформо-специфичным кодом
 *
 * React Native поддерживает iOS, Android и Web.
 * Этот модуль предоставляет:
 * - Константы для определения текущей платформы
 * - Размеры экрана
 * - Платформо-специфичные стили (тени, отступы)
 *
 * Platform.select() - выбирает значение в зависимости от платформы
 * Platform.OS - возвращает 'ios', 'android' или 'web'
 */
import { Platform, Dimensions } from 'react-native';

// === ОПРЕДЕЛЕНИЕ ПЛАТФОРМЫ ===
// Булевы константы для условного рендеринга
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';

// === РАЗМЕРЫ ЭКРАНА ===
// Dimensions.get('window') возвращает размеры видимой области
const { width, height } = Dimensions.get('window');
export const screenWidth = width;
export const screenHeight = height;
export const isSmallScreen = width < 375;   // iPhone SE, маленькие Android
export const isLargeScreen = width >= 768;  // iPad, планшеты

// === ПЛАТФОРМО-СПЕЦИФИЧНЫЕ ЗНАЧЕНИЯ ===

/**
 * hitSlop - расширяет область нажатия для TouchableOpacity
 * Android имеет большие значения из-за особенностей тач-экранов
 */
export const hitSlop = Platform.select({
  ios: { top: 10, bottom: 10, left: 10, right: 10 },
  android: { top: 12, bottom: 12, left: 12, right: 12 },
  default: { top: 8, bottom: 8, left: 8, right: 8 },
});

/**
 * shadowStyle - кроссплатформенные тени
 *
 * iOS: использует свойства shadow* (shadowColor, shadowOffset, shadowOpacity, shadowRadius)
 * Android: использует elevation (одно число 0-24)
 *
 * Это связано с разными движками рендеринга на платформах
 */
export const shadowStyle = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  android: {
    elevation: 3, // Material Design elevation
  },
  default: {},
});

/**
 * statusBarHeight - высота статус-бара
 * iOS: 44px (с учётом Dynamic Island/Notch)
 * Android: 24px (стандартный статус-бар)
 */
export const statusBarHeight = Platform.select({
  ios: 44,
  android: 24,
  default: 0,
});

/**
 * tabBarHeight - высота нижней навигации
 * iOS: 83px (включает home indicator на iPhone X+)
 * Android: 56px (Material Design)
 */
export const tabBarHeight = Platform.select({
  ios: 83,
  android: 56,
  default: 60,
});

/**
 * fontFamily - системный шрифт
 * iOS: San Francisco (System)
 * Android: Roboto
 */
export const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

/**
 * inputPadding - внутренние отступы для полей ввода
 * iOS имеет чуть больше padding для лучшего UX
 */
export const inputPadding = Platform.select({
  ios: 12,
  android: 10,
  default: 12,
});
