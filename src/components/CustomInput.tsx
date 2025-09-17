import React from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Colors, Sizes } from '../constants/Colors';

interface CustomInputProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function CustomInput({ 
  label, 
  error, 
  icon, 
  style, 
  ...props 
}: CustomInputProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          style={[
            styles.input, 
            icon ? styles.inputWithIcon : null, 
            style
          ]}
          placeholderTextColor={Colors.textSecondary}
          {...props}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Sizes.md,
  },
  label: {
    fontSize: Sizes.fontMD,
    fontWeight: '500',
    color: Colors.textPrimary,
    marginBottom: Sizes.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: Sizes.borderRadius,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    paddingHorizontal: Sizes.md,
    height: Sizes.inputHeight,
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputError: {
    borderColor: Colors.error,
  },
  icon: {
    marginRight: Sizes.sm,
  },
  input: {
    flex: 1,
    fontSize: Sizes.fontMD,
    color: Colors.textPrimary,
    height: '100%',
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  errorText: {
    fontSize: Sizes.fontSM,
    color: Colors.error,
    marginTop: Sizes.xs,
  },
});