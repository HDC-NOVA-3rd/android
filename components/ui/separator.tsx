import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';

export function Separator({ style, ...props }: ViewProps) {
  return <View style={[styles.separator, style]} {...props} />;
}

const styles = StyleSheet.create({
  separator: {
    height: 1,
    width: '100%',
    backgroundColor: '#e5e7eb',
  },
});
