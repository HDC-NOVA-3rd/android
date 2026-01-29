import React from 'react';
import { TextInput, TextInputProps, StyleSheet } from 'react-native';

export function Input({ style, ...props }: TextInputProps) {
  return (
    <TextInput
      style={[styles.input, style]}
      placeholderTextColor="#9ca3af"
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    height: 44,
    width: '100%',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    fontSize: 14,
    color: '#111827',
  },
});
