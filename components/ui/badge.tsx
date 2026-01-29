import React from 'react';
import { View, Text, StyleSheet, ViewProps } from 'react-native';

interface BadgeProps extends ViewProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  children: React.ReactNode;
}

export function Badge({ variant = 'default', style, children, ...props }: BadgeProps) {
  let containerStyle = { ...styles.base };
  let textStyle = { ...styles.textBase };

  switch (variant) {
    case 'default':
      containerStyle = { ...containerStyle, ...styles.defaultContainer };
      textStyle = { ...textStyle, ...styles.defaultText };
      break;
    case 'secondary':
      containerStyle = { ...containerStyle, ...styles.secondaryContainer };
      textStyle = { ...textStyle, ...styles.secondaryText };
      break;
    case 'destructive':
      containerStyle = { ...containerStyle, ...styles.destructiveContainer };
      textStyle = { ...textStyle, ...styles.destructiveText };
      break;
    case 'outline':
      containerStyle = { ...containerStyle, ...styles.outlineContainer };
      textStyle = { ...textStyle, ...styles.outlineText };
      break;
  }

  return (
    <View style={[containerStyle, style]} {...props}>
      <Text style={textStyle}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  textBase: {
    fontSize: 12,
    fontWeight: '600',
  },
  defaultContainer: {
    backgroundColor: '#111827',
  },
  defaultText: {
    color: '#ffffff',
  },
  secondaryContainer: {
    backgroundColor: '#f3f4f6',
  },
  secondaryText: {
    color: '#1f2937',
  },
  destructiveContainer: {
    backgroundColor: '#ef4444',
  },
  destructiveText: {
    color: '#ffffff',
  },
  outlineContainer: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  outlineText: {
    color: '#111827',
  },
});
