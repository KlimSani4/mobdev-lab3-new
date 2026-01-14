import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

interface UseImagePickerResult {
  imageUri: string | null;
  loading: boolean;
  pickFromGallery: () => Promise<string | null>;
  takePhoto: () => Promise<string | null>;
  clearImage: () => void;
  showPicker: () => void;
}

export function useImagePicker(initialUri: string | null = null): UseImagePickerResult {
  const [imageUri, setImageUri] = useState<string | null>(initialUri);
  const [loading, setLoading] = useState(false);

  const requestPermission = async (type: 'camera' | 'gallery'): Promise<boolean> => {
    if (Platform.OS === 'web') return true;

    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Нет доступа', 'Разрешите доступ к камере в настройках');
        return false;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Нет доступа', 'Разрешите доступ к галерее в настройках');
        return false;
      }
    }
    return true;
  };

  const pickFromGallery = useCallback(async (): Promise<string | null> => {
    const hasPermission = await requestPermission('gallery');
    if (!hasPermission) return null;

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        return uri;
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const takePhoto = useCallback(async (): Promise<string | null> => {
    const hasPermission = await requestPermission('camera');
    if (!hasPermission) return null;

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        return uri;
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearImage = useCallback(() => {
    setImageUri(null);
  }, []);

  const showPicker = useCallback(() => {
    Alert.alert('Выберите фото', '', [
      { text: 'Камера', onPress: takePhoto },
      { text: 'Галерея', onPress: pickFromGallery },
      { text: 'Отмена', style: 'cancel' },
    ]);
  }, [takePhoto, pickFromGallery]);

  return {
    imageUri,
    loading,
    pickFromGallery,
    takePhoto,
    clearImage,
    showPicker,
  };
}
