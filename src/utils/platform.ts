import { Platform, Dimensions } from 'react-native';

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';

const { width, height } = Dimensions.get('window');
export const screenWidth = width;
export const screenHeight = height;
export const isSmallScreen = width < 375;
export const isLargeScreen = width >= 768;

export const hitSlop = Platform.select({
  ios: { top: 10, bottom: 10, left: 10, right: 10 },
  android: { top: 12, bottom: 12, left: 12, right: 12 },
  default: { top: 8, bottom: 8, left: 8, right: 8 },
});

export const shadowStyle = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  android: {
    elevation: 3,
  },
  default: {},
});

export const statusBarHeight = Platform.select({
  ios: 44,
  android: 24,
  default: 0,
});

export const tabBarHeight = Platform.select({
  ios: 83,
  android: 56,
  default: 60,
});

export const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const inputPadding = Platform.select({
  ios: 12,
  android: 10,
  default: 12,
});
