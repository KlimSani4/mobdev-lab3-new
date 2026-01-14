import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Загрузка...' }: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#6200EE" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
});
