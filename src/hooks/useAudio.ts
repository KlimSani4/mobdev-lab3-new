import { useState, useCallback, useEffect, useRef } from 'react';
import { Audio } from 'expo-av';

interface UseAudioResult {
  isPlaying: boolean;
  playSound: (uri: string) => Promise<void>;
  stopSound: () => Promise<void>;
  playNotification: () => Promise<void>;
}

export function useAudio(): UseAudioResult {
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
    });

    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  const stopSound = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setIsPlaying(false);
    }
  }, []);

  const playSound = useCallback(async (uri: string) => {
    await stopSound();

    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setIsPlaying(true);

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false);
          sound.unloadAsync();
          soundRef.current = null;
        }
      });
    } catch {
      setIsPlaying(false);
    }
  }, [stopSound]);

  const playNotification = useCallback(async () => {
    await stopSound();

    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/notification.mp3'),
        { shouldPlay: true }
      );
      soundRef.current = sound;

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
          soundRef.current = null;
        }
      });
    } catch {
      // Notification sound not available
    }
  }, [stopSound]);

  return {
    isPlaying,
    playSound,
    stopSound,
    playNotification,
  };
}
