# Лабораторная работа №3: Навигация и мультимедиа

## Цель работы
Научиться реализовывать навигацию между экранами в мобильном приложении и добавлять функциональность работы с мультимедиа-ресурсами.

## Задачи
1. Создать навигационную структуру приложения
2. Реализовать работу с мультимедиа (изображения, видео, аудио)

## Навигация

### Используемые библиотеки
```json
{
  "@react-navigation/native": "^7.1.27",
  "@react-navigation/bottom-tabs": "^7.9.1",
  "@react-navigation/native-stack": "^7.9.1"
}
```

### Архитектура навигации

```
┌─────────────────────────────────────────┐
│            Stack.Navigator              │
│  ┌───────────────────────────────────┐  │
│  │         MainTabs (Tab.Navigator)  │  │
│  │  ┌─────────┬─────────┬─────────┐  │  │
│  │  │TaskList │CreateTask│ Profile │  │  │
│  │  │   📋    │    ➕    │   👤    │  │  │
│  │  └─────────┴─────────┴─────────┘  │  │
│  └───────────────────────────────────┘  │
│                    │                    │
│                    ▼                    │
│  ┌───────────────────────────────────┐  │
│  │         TaskDetailScreen          │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Реализация навигации (App.tsx)

```tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Типизация параметров навигации
type RootStackParamList = {
  MainTabs: undefined;
  TaskDetail: { taskId: string };
};

type MainTabParamList = {
  TaskList: undefined;
  CreateTask: undefined;
  Profile: undefined;
};

// Создание навигаторов
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Нижняя табуляция
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#6200EE',    // Активный цвет
        tabBarInactiveTintColor: '#999',      // Неактивный цвет
        headerStyle: { backgroundColor: '#6200EE' },
        headerTintColor: '#FFF',
      }}
    >
      <Tab.Screen
        name="TaskList"
        component={TaskListScreen}
        options={{
          title: 'Задачи',
          tabBarIcon: ({ color }) => <Text style={{ color }}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="CreateTask"
        component={CreateTaskScreen}
        options={{
          title: 'Создать',
          tabBarIcon: ({ color }) => <Text style={{ color }}>➕</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Профиль',
          tabBarIcon: ({ color }) => <Text style={{ color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

// Корневой навигатор
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }} // Скрываем заголовок для табов
        />
        <Stack.Screen
          name="TaskDetail"
          component={TaskDetailScreen}
          options={{ title: 'Детали задачи' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### Навигация между экранами

```tsx
// Переход на детальный экран с параметром
function TaskListScreen({ navigation }) {
  const handleTaskPress = (taskId: string) => {
    navigation.navigate('TaskDetail', { taskId });
  };

  return (
    <TaskCard onPress={() => handleTaskPress(task.id)} />
  );
}

// Получение параметра на целевом экране
function TaskDetailScreen({ route }) {
  const { taskId } = route.params;
  // Используем taskId для загрузки данных
}

// Возврат назад
function TaskDetailScreen({ navigation }) {
  const handleGoBack = () => {
    navigation.goBack();
  };
}
```

## Мультимедиа

### 1. Работа с изображениями (expo-image-picker)

```tsx
// src/hooks/useImagePicker.ts
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export function useImagePicker() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Запрос разрешений (не нужен на web)
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const cameraResult = await ImagePicker.requestCameraPermissionsAsync();
      const mediaResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraResult.status !== 'granted' || mediaResult.status !== 'granted') {
        Alert.alert('Ошибка', 'Нужен доступ к камере и галерее');
        return false;
      }
    }
    return true;
  };

  // Выбор из галереи
  const pickFromGallery = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setLoading(true);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,        // Разрешить редактирование
      aspect: [1, 1],             // Соотношение сторон для кропа
      quality: 0.8,               // Качество (0-1)
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
    setLoading(false);
  };

  // Съемка камерой
  const takePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setLoading(true);
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
    setLoading(false);
  };

  return { image, loading, pickFromGallery, takePhoto, clearImage: () => setImage(null) };
}
```

**Использование в компоненте:**
```tsx
function ProfileScreen() {
  const { image, pickFromGallery, takePhoto } = useImagePicker();

  const showImageOptions = () => {
    Alert.alert('Выберите источник', '', [
      { text: 'Камера', onPress: takePhoto },
      { text: 'Галерея', onPress: pickFromGallery },
      { text: 'Отмена', style: 'cancel' },
    ]);
  };

  return (
    <TouchableOpacity onPress={showImageOptions}>
      {image ? (
        <Image source={{ uri: image }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Text>📷</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
```

### 2. Работа с видео (expo-av)

```tsx
// src/components/VideoPlayer.tsx
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

export function VideoPlayer({ uri }: { uri: string }) {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Отслеживание статуса воспроизведения
  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsLoaded(true);
      setIsPlaying(status.isPlaying);
    }
  };

  // Переключение воспроизведения
  const togglePlayback = async () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      await videoRef.current.pauseAsync();
    } else {
      await videoRef.current.playAsync();
    }
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri }}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        useNativeControls={false}  // Используем свои контролы
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />

      {/* Оверлей с кнопкой воспроизведения */}
      <TouchableOpacity style={styles.overlay} onPress={togglePlayback}>
        {!isPlaying && (
          <View style={styles.playButton}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Индикатор загрузки */}
      {!isLoaded && (
        <View style={styles.loadingOverlay}>
          <Text>Загрузка...</Text>
        </View>
      )}
    </View>
  );
}
```

### 3. Работа с аудио (expo-av)

```tsx
// src/hooks/useAudio.ts
import { Audio } from 'expo-av';

export function useAudio() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Настройка аудио режима
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,  // Играть даже в беззвучном режиме
      staysActiveInBackground: false,
    });
  }, []);

  // Воспроизведение звука
  const playSound = async (uri: string) => {
    // Остановить предыдущий звук
    if (sound) {
      await sound.unloadAsync();
    }

    const { sound: newSound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true }
    );

    setSound(newSound);
    setIsPlaying(true);

    // Отслеживание окончания
    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        setIsPlaying(false);
      }
    });
  };

  // Остановка звука
  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      setIsPlaying(false);
    }
  };

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return { playSound, stopSound, isPlaying };
}
```

### 4. Отображение изображений

```tsx
// Простое отображение изображения
import { Image } from 'react-native';

<Image
  source={{ uri: 'https://example.com/image.jpg' }}
  style={{ width: 100, height: 100, borderRadius: 50 }}
  resizeMode="cover"
/>

// Локальное изображение
<Image
  source={require('../assets/icon.png')}
  style={{ width: 50, height: 50 }}
/>
```

## Структура мультимедиа в проекте

```
src/
├── hooks/
│   ├── useImagePicker.ts   # Выбор фото с камеры/галереи
│   └── useAudio.ts         # Воспроизведение звуков
├── components/
│   └── VideoPlayer.tsx     # Компонент видеоплеера
assets/
├── icon.png               # Иконка приложения
├── splash-icon.png        # Экран загрузки
└── notification.mp3       # Звук уведомления
```

## Разрешения (Permissions)

### iOS (app.json)
```json
{
  "expo": {
    "ios": {
      "infoPlist": {
        "NSCameraUsageDescription": "Приложение использует камеру для фото профиля",
        "NSPhotoLibraryUsageDescription": "Приложение использует галерею для выбора фото",
        "NSMicrophoneUsageDescription": "Приложение использует микрофон для записи"
      }
    }
  }
}
```

### Android (app.json)
```json
{
  "expo": {
    "android": {
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE",
        "RECORD_AUDIO"
      ]
    }
  }
}
```

## Вопросы для защиты

1. **Какие типы навигаторов есть в React Navigation?**
   - Stack Navigator - стековая навигация (push/pop)
   - Tab Navigator - нижние/верхние вкладки
   - Drawer Navigator - боковое меню
   - Native Stack - нативная реализация стека (производительнее)

2. **Как передать параметры между экранами?**
   ```tsx
   // Отправка
   navigation.navigate('Screen', { id: '123' });
   // Получение
   const { id } = route.params;
   ```

3. **Чем отличается expo-image-picker от react-native-image-picker?**
   - expo-image-picker интегрирован в Expo, не требует native linking
   - Работает в Expo Go без ejecting
   - Проще API, меньше настроек

4. **Как обрабатывать разрешения на камеру?**
   - Использовать `requestCameraPermissionsAsync()`
   - Проверять результат перед использованием
   - Показывать пользователю причину запроса

5. **Почему Video использует ref?**
   - Для императивного управления (play, pause, seek)
   - Доступ к методам компонента напрямую
   - Не требует перерендера для управления

## Ссылки
- [React Navigation](https://reactnavigation.org/)
- [Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/)
- [Expo AV](https://docs.expo.dev/versions/latest/sdk/av/)
