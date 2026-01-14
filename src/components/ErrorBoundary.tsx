import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '../utils/theme';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error);
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <Text style={styles.icon}>⚠️</Text>
          <Text style={styles.title}>Что-то пошло не так</Text>
          <Text style={styles.message}>
            Произошла непредвиденная ошибка. Попробуйте перезагрузить.
          </Text>
          {__DEV__ && this.state.error && (
            <Text style={styles.errorDetails}>{this.state.error.message}</Text>
          )}
          <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
            <Text style={styles.buttonText}>Попробовать снова</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  errorDetails: {
    fontSize: 12,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.lg,
    fontFamily: 'monospace',
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
  },
  buttonText: {
    color: colors.text.inverse,
    fontSize: 16,
    fontWeight: '500',
  },
});
