import React, { useRef } from 'react';
import {
  TouchableWithoutFeedback,
  TouchableNativeFeedback,
  Text,
  View,
  StyleSheet,
  Platform,
  StyleProp,
  ViewStyle,
  Animated,
} from 'react-native';
import { colors, borderRadius, spacing } from '../utils/theme';

interface PlatformButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * PlatformButton - кнопка с анимацией нажатия
 *
 * Анимации:
 * 1. Scale down при нажатии (0.95)
 * 2. Spring back при отпускании
 *
 * На Android также сохраняется ripple эффект
 */
export function PlatformButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}: PlatformButtonProps) {
  // Animated.Value для scale эффекта
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const backgroundColor = {
    primary: colors.primary,
    secondary: colors.surface,
    danger: colors.error,
  }[variant];

  const textColor = variant === 'secondary' ? colors.text.primary : colors.text.inverse;

  /**
   * Обработчик нажатия (press in)
   * Уменьшаем кнопку с spring анимацией
   */
  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  /**
   * Обработчик отпускания (press out)
   * Возвращаем к исходному размеру с более выраженным spring
   */
  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 10,
    }).start();
  };

  const buttonContent = (
    <Animated.View
      style={[
        styles.button,
        { backgroundColor, transform: [{ scale: scaleAnim }] },
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </Animated.View>
  );

  // На Android используем TouchableNativeFeedback для ripple эффекта
  // но оборачиваем в Animated.View для scale анимации
  if (Platform.OS === 'android' && !disabled) {
    return (
      <TouchableWithoutFeedback
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View>
          <TouchableNativeFeedback
            onPress={onPress}
            background={TouchableNativeFeedback.Ripple('#ffffff40', false)}
          >
            {buttonContent}
          </TouchableNativeFeedback>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      {buttonContent}
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: Platform.select({ ios: 14, android: 12, default: 14 }),
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
  disabled: {
    opacity: 0.5,
  },
});
