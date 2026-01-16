/**
 * SearchBar - компонент поиска с debounce
 *
 * Особенности:
 * - Debounce для оптимизации поиска (не вызывает onSearch при каждом нажатии)
 * - Иконка очистки при наличии текста
 * - Анимация фокуса
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../utils/theme';

interface SearchBarProps {
  /** Callback при изменении поискового запроса (с debounce) */
  onSearch: (query: string) => void;
  /** Placeholder текст */
  placeholder?: string;
  /** Задержка debounce в мс */
  debounceMs?: number;
  /** Начальное значение */
  initialValue?: string;
}

export function SearchBar({
  onSearch,
  placeholder = 'Поиск задач...',
  debounceMs = 300,
  initialValue = '',
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  // Animated value для эффекта фокуса
  const focusAnim = useRef(new Animated.Value(0)).current;

  // Debounce эффект - вызывает onSearch с задержкой
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(value);
    }, debounceMs);

    // Cleanup - отменяет предыдущий таймер при новом вводе
    return () => clearTimeout(timer);
  }, [value, debounceMs, onSearch]);

  // Анимация при фокусе
  useEffect(() => {
    Animated.spring(focusAnim, {
      toValue: isFocused ? 1 : 0,
      useNativeDriver: false,
      speed: 20,
      bounciness: 4,
    }).start();
  }, [isFocused, focusAnim]);

  const handleClear = () => {
    setValue('');
  };

  // Интерполяция цвета границы
  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.border, colors.primary],
  });

  return (
    <Animated.View style={[styles.container, { borderColor }]}>
      {/* Иконка поиска */}
      <View style={styles.iconContainer}>
        <SearchIcon color={isFocused ? colors.primary : colors.text.tertiary} />
      </View>

      {/* Поле ввода */}
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        placeholderTextColor={colors.text.tertiary}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Кнопка очистки */}
      {value.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ClearIcon color={colors.text.tertiary} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
}

// Простая иконка поиска (лупа)
function SearchIcon({ color }: { color: string }) {
  return (
    <View style={[styles.searchIcon, { borderColor: color }]}>
      <View style={[styles.searchHandle, { backgroundColor: color }]} />
    </View>
  );
}

// Простая иконка очистки (крестик)
function ClearIcon({ color }: { color: string }) {
  return (
    <View style={styles.clearIcon}>
      <View style={[styles.clearLine1, { backgroundColor: color }]} />
      <View style={[styles.clearLine2, { backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1.5,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 48,
    ...shadows.small,
  },
  iconContainer: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    paddingVertical: 0,
  },
  clearButton: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  // Иконка поиска (лупа из CSS)
  searchIcon: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderRadius: 8,
    position: 'relative',
  },
  searchHandle: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 6,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  // Иконка очистки (крестик)
  clearIcon: {
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearLine1: {
    position: 'absolute',
    width: 12,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }],
  },
  clearLine2: {
    position: 'absolute',
    width: 12,
    height: 2,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }],
  },
});
