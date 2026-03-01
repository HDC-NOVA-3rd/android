import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';

export function Label({ style, ...props }: TextProps) {
  return <Text style={[styles.label, style]} {...props} />;
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    color: '#111827',
    marginBottom: 6,
  },
});
