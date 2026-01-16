# Лабораторная работа №5: Платформо-специфичная функциональность

## Цель работы
Разработать и протестировать функциональность, специфичную для мобильных платформ (iOS, Android), обеспечив совместимость и корректную работу.

## Задачи
1. Создать платформо-специфичную функциональность
2. Провести тестирование совместимости на разных платформах

## Определение платформы

### Platform API (src/utils/platform.ts)

```tsx
import { Platform, Dimensions } from 'react-native';

// Определение текущей платформы
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';

// Размеры экрана
const { width, height } = Dimensions.get('window');
export const screenWidth = width;
export const screenHeight = height;
export const isSmallScreen = width < 375;  // iPhone SE
export const isLargeScreen = width >= 768; // iPad/Tablet
```

### Platform.select() - условные значения

```tsx
// Разные значения для разных платформ
export const hitSlop = Platform.select({
  ios: { top: 10, bottom: 10, left: 10, right: 10 },
  android: { top: 12, bottom: 12, left: 12, right: 12 },
  default: { top: 8, bottom: 8, left: 8, right: 8 },
});

// Тени (разная реализация на iOS и Android)
export const shadowStyle = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  android: {
    elevation: 3, // Android использует elevation вместо shadow
  },
  default: {},
});

// Высота системных элементов
export const statusBarHeight = Platform.select({
  ios: 44,      // Dynamic Island / Notch
  android: 24,  // Standard status bar
  default: 0,
});

export const tabBarHeight = Platform.select({
  ios: 83,      // С home indicator
  android: 56,  // Material Design
  default: 60,
});

// Системные шрифты
export const fontFamily = Platform.select({
  ios: 'System',   // San Francisco
  android: 'Roboto',
  default: 'System',
});
```

## Платформо-специфичные компоненты

### PlatformButton - нативный feedback

```tsx
// src/components/PlatformButton.tsx
import {
  TouchableOpacity,
  TouchableNativeFeedback,
  Platform,
  View,
} from 'react-native';

interface PlatformButtonProps {
  onPress: () => void;
  title: string;
  style?: object;
}

export function PlatformButton({ onPress, title, style }: PlatformButtonProps) {
  // Android: используем TouchableNativeFeedback с ripple эффектом
  if (Platform.OS === 'android') {
    return (
      <TouchableNativeFeedback
        onPress={onPress}
        background={TouchableNativeFeedback.Ripple(
          'rgba(98, 0, 238, 0.3)', // Цвет ripple
          false // Выходит ли за границы
        )}
      >
        <View style={[styles.button, style]}>
          <Text style={styles.buttonText}>{title}</Text>
        </View>
      </TouchableNativeFeedback>
    );
  }

  // iOS и Web: используем TouchableOpacity
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
}
```

### Платформо-специфичные стили

```tsx
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    // iOS тени
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    // Разные отступы для платформ
    padding: Platform.select({
      ios: 12,
      android: 10,
    }),
  },
});
```

## Платформо-специфичные разрешения

### useImagePicker с проверкой платформы

```tsx
// src/hooks/useImagePicker.ts
export function useImagePicker() {
  const requestPermissions = async () => {
    // На web разрешения не нужны
    if (Platform.OS === 'web') {
      return true;
    }

    // iOS и Android требуют разрешения
    const cameraResult = await ImagePicker.requestCameraPermissionsAsync();
    const mediaResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraResult.status !== 'granted') {
      Alert.alert(
        'Нет доступа к камере',
        Platform.select({
          ios: 'Перейдите в Настройки > Конфиденциальность > Камера',
          android: 'Разрешите доступ в настройках приложения',
        })
      );
      return false;
    }

    return true;
  };
  // ...
}
```

### Конфигурация разрешений (app.json)

```json
{
  "expo": {
    "ios": {
      "supportsTablet": true,
      "infoPlist": {
        "NSCameraUsageDescription": "Приложение использует камеру для создания фото",
        "NSPhotoLibraryUsageDescription": "Приложение использует галерею для выбора изображений",
        "NSMicrophoneUsageDescription": "Приложение использует микрофон для записи аудио"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ],
      "edgeToEdgeEnabled": true
    }
  }
}
```

## Платформо-специфичные файлы

### Файловая структура

```
src/
├── components/
│   ├── Button.tsx          # Общий компонент
│   ├── Button.ios.tsx      # iOS-специфичная версия
│   └── Button.android.tsx  # Android-специфичная версия
```

React Native автоматически выбирает правильный файл:
- На iOS импортируется `Button.ios.tsx`
- На Android импортируется `Button.android.tsx`
- Если специфичного файла нет - используется `Button.tsx`

### Пример платформо-специфичного компонента

```tsx
// Button.ios.tsx
import { TouchableOpacity, Text } from 'react-native';

export function Button({ title, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: '#007AFF', // iOS синий
        borderRadius: 10,
        padding: 12,
      }}
    >
      <Text style={{ color: '#FFF', textAlign: 'center' }}>{title}</Text>
    </TouchableOpacity>
  );
}

// Button.android.tsx
import { TouchableNativeFeedback, View, Text } from 'react-native';

export function Button({ title, onPress }) {
  return (
    <TouchableNativeFeedback onPress={onPress}>
      <View style={{
        backgroundColor: '#6200EE', // Material Purple
        borderRadius: 4,
        padding: 10,
      }}>
        <Text style={{ color: '#FFF', textAlign: 'center' }}>{title}</Text>
      </View>
    </TouchableNativeFeedback>
  );
}
```

## Тестирование совместимости

### Способы тестирования

| Способ | iOS | Android | Web |
|--------|-----|---------|-----|
| Expo Go | ✓ | ✓ | - |
| Симулятор iOS | ✓ | - | - |
| Android Emulator | - | ✓ | - |
| Браузер | - | - | ✓ |
| Реальное устройство | ✓ | ✓ | ✓ |

### Чек-лист тестирования

```markdown
## iOS
- [ ] Корректное отображение на iPhone с notch
- [ ] Корректное отображение на iPhone без notch
- [ ] SafeAreaView работает правильно
- [ ] Тени отображаются (shadow*)
- [ ] Камера и галерея работают
- [ ] Жесты навигации работают

## Android
- [ ] Корректное отображение на устройствах с разными DPI
- [ ] Elevation тени работают
- [ ] Ripple эффект на кнопках
- [ ] Back button работает для навигации
- [ ] Разрешения запрашиваются корректно

## Web
- [ ] Responsive layout
- [ ] Hover состояния работают
- [ ] Клавиатурная навигация
```

### Результаты тестирования проекта

| Функция | iOS | Android | Web |
|---------|-----|---------|-----|
| Навигация (tabs) | ✓ | ✓ | ✓ |
| Список задач (FlatList) | ✓ | ✓ | ✓ |
| Pull-to-refresh | ✓ | ✓ | Частично |
| Фильтр категорий | ✓ | ✓ | ✓ |
| Детали задачи | ✓ | ✓ | ✓ |
| Создание задачи | ✓ | ✓ | ✓ |
| Профиль пользователя | ✓ | ✓ | ✓ |
| Выбор фото (камера) | ✓ | ✓ | - |
| Выбор фото (галерея) | ✓ | ✓ | ✓ |
| Видеоплеер | ✓ | ✓ | ✓ |
| AsyncStorage | ✓ | ✓ | ✓ |
| Тени | ✓ | ✓ | ✓ |

## Вопросы для защиты

1. **Как React Native определяет платформу?**
   - `Platform.OS` возвращает 'ios', 'android' или 'web'
   - Определяется во время компиляции/bundling
   - Можно использовать условный рендеринг

2. **Чем отличаются тени на iOS и Android?**
   - iOS: shadowColor, shadowOffset, shadowOpacity, shadowRadius
   - Android: elevation (одно число 0-24)
   - Разная модель рендеринга теней

3. **Зачем нужен TouchableNativeFeedback?**
   - Нативный ripple эффект на Android
   - Соответствует Material Design guidelines
   - Лучший UX для Android пользователей

4. **Как работают .ios.tsx и .android.tsx файлы?**
   - Metro bundler автоматически выбирает нужный файл
   - Не требует условий в коде
   - Удобно для больших платформо-специфичных различий

5. **Как тестировать на разных платформах?**
   - Expo Go для быстрого тестирования
   - Симуляторы для детального тестирования
   - Реальные устройства для финального QA

## Ссылки
- [Platform Specific Code](https://reactnative.dev/docs/platform-specific-code)
- [Platform Module](https://reactnative.dev/docs/platform)
- [Expo Platform APIs](https://docs.expo.dev/versions/latest/react-native/platform/)
