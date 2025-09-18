import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors, Sizes } from '../constants/Colors';

interface LoadingComponentProps {
  message?: string;
  size?: 'small' | 'large';
  style?: object;
}

export default function LoadingComponent({ 
  message = 'Cargando...', 
  size = 'large',
  style 
}: LoadingComponentProps) {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={Colors.primary} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Sizes.xl * 2,
  },
  message: {
    fontSize: Sizes.fontMD,
    color: Colors.textSecondary,
    marginTop: Sizes.lg,
    textAlign: 'center',
    fontWeight: '500',
  },
});