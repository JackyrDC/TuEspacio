import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Sizes } from '../constants/Colors';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  buttonText?: string;
  onButtonPress?: () => void;
  style?: object;
}

export default function EmptyState({ 
  icon = 'home-outline',
  title,
  description,
  buttonText,
  onButtonPress,
  style 
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon as any} size={80} color={Colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {buttonText && onButtonPress && (
        <TouchableOpacity style={styles.button} onPress={onButtonPress}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Sizes.xl,
    paddingVertical: Sizes.xl * 2,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Sizes.xl,
  },
  title: {
    fontSize: Sizes.fontXL,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: Sizes.md,
    textAlign: 'center',
  },
  description: {
    fontSize: Sizes.fontMD,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Sizes.xl,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Sizes.xl * 1.5,
    paddingVertical: Sizes.md,
    borderRadius: Sizes.borderRadius,
    elevation: 2,
    shadowColor: Colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: Sizes.fontMD,
    color: Colors.white,
    fontWeight: '600',
  },
});