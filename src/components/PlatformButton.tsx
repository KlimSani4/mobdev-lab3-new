import React from 'react';
import {
  TouchableOpacity,
  TouchableNativeFeedback,
  Text,
  View,
  StyleSheet,
  Platform,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors, borderRadius, spacing } from '../utils/theme';

interface PlatformButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function PlatformButton({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}: PlatformButtonProps) {
  const backgroundColor = {
    primary: colors.primary,
    secondary: colors.surface,
    danger: colors.error,
  }[variant];

  const textColor = variant === 'secondary' ? colors.text.primary : colors.text.inverse;

  const buttonContent = (
    <View
      style={[
        styles.button,
        { backgroundColor },
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </View>
  );

  if (Platform.OS === 'android' && !disabled) {
    return (
      <TouchableNativeFeedback
        onPress={onPress}
        background={TouchableNativeFeedback.Ripple('#ffffff40', false)}
      >
        {buttonContent}
      </TouchableNativeFeedback>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.7}>
      {buttonContent}
    </TouchableOpacity>
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
