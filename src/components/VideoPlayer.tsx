/**
 * VideoPlayer - компонент для воспроизведения видео
 *
 * Использует expo-av для работы с мультимедиа.
 * Демонстрирует:
 * - useRef для императивного управления Video компонентом
 * - Кастомный UI поверх видео (оверлей с кнопкой play)
 * - Отслеживание статуса воспроизведения
 *
 * @param uri - URL видеофайла
 * @param style - дополнительные стили контейнера
 */
import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';

interface VideoPlayerProps {
  uri: string;
  style?: object;
}

export function VideoPlayer({ uri, style }: VideoPlayerProps) {
  // useRef создаёт ссылку на Video компонент для императивного управления
  // В отличие от useState, изменение ref не вызывает перерендер
  const videoRef = useRef<Video>(null);

  // Состояние воспроизведения
  const [isPlaying, setIsPlaying] = useState(false);
  // Состояние загрузки видео
  const [isLoaded, setIsLoaded] = useState(false);

  /**
   * Колбэк для отслеживания статуса воспроизведения
   * Вызывается при каждом изменении состояния видео
   */
  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    // Проверяем, что видео загружено (isLoaded есть только у загруженного видео)
    if (status.isLoaded) {
      setIsLoaded(true);
      setIsPlaying(status.isPlaying);
    }
  };

  /**
   * Переключение воспроизведения (play/pause)
   * Использует ref для прямого вызова методов Video компонента
   */
  const togglePlayback = async () => {
    if (!videoRef.current) return; // Защита от null

    if (isPlaying) {
      await videoRef.current.pauseAsync(); // Императивная пауза
    } else {
      await videoRef.current.playAsync();  // Императивный запуск
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Video
        ref={videoRef}
        source={{ uri }}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        useNativeControls={false}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />
      <TouchableOpacity style={styles.overlay} onPress={togglePlayback}>
        {!isPlaying && (
          <View style={styles.playButton}>
            <Text style={styles.playIcon}>▶</Text>
          </View>
        )}
      </TouchableOpacity>
      {!isLoaded && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  video: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 24,
    color: '#6200EE',
    marginLeft: 4,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFF',
    fontSize: 14,
  },
});
