import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'default', 
  size = 'default', 
  className, 
  style, 
  children, 
  ...props 
}: ButtonProps) {
  
  let containerStyle: ViewStyle = { ...styles.base };
  let textStyle: TextStyle = { ...styles.textBase };

  // Variants
  switch (variant) {
    case 'default':
      containerStyle = { ...containerStyle, ...styles.defaultContainer };
      textStyle = { ...textStyle, ...styles.defaultText };
      break;
    case 'destructive':
      containerStyle = { ...containerStyle, ...styles.destructiveContainer };
      textStyle = { ...textStyle, ...styles.destructiveText };
      break;
    case 'outline':
      containerStyle = { ...containerStyle, ...styles.outlineContainer };
      textStyle = { ...textStyle, ...styles.outlineText };
      break;
    case 'secondary':
      containerStyle = { ...containerStyle, ...styles.secondaryContainer };
      textStyle = { ...textStyle, ...styles.secondaryText };
      break;
    case 'ghost':
      containerStyle = { ...containerStyle, ...styles.ghostContainer };
      textStyle = { ...textStyle, ...styles.ghostText };
      break;
    case 'link':
      containerStyle = { ...containerStyle, ...styles.linkContainer };
      textStyle = { ...textStyle, ...styles.linkText };
      break;
  }

  // Sizes
  switch (size) {
    case 'default':
      containerStyle = { ...containerStyle, height: 44, paddingHorizontal: 16 };
      break;
    case 'sm':
      containerStyle = { ...containerStyle, height: 36, paddingHorizontal: 12 };
      textStyle = { ...textStyle, fontSize: 12 };
      break;
    case 'lg':
      containerStyle = { ...containerStyle, height: 50, paddingHorizontal: 32 };
      break;
    case 'icon':
      containerStyle = { ...containerStyle, height: 40, width: 40, paddingHorizontal: 0 };
      break;
  }

  return (
    <TouchableOpacity 
      style={[containerStyle, style]} 
      activeOpacity={0.7}
      {...props}
    >
      <Text style={textStyle}>{children}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  textBase: {
    fontSize: 14,
    fontWeight: '500',
  },
  defaultContainer: {
    backgroundColor: '#111827',
  },
  defaultText: {
    color: '#ffffff',
  },
  destructiveContainer: {
    backgroundColor: '#ef4444',
  },
  destructiveText: {
    color: '#ffffff',
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  outlineText: {
    color: '#111827',
  },
  secondaryContainer: {
    backgroundColor: '#f3f4f6',
  },
  secondaryText: {
    color: '#111827',
  },
  ghostContainer: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: '#111827',
  },
  linkContainer: {
    backgroundColor: 'transparent',
  },
  linkText: {
    color: '#111827',
    textDecorationLine: 'underline',
  },
});
