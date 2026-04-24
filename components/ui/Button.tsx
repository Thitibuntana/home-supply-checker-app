import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';
import { FONT_SIZE, FONT_WEIGHT, RADIUS } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  style,
  textStyle,
  fullWidth = false,
  disabled,
  ...rest
}: ButtonProps) {
  const { colors } = useTheme();

  const bgColor: Record<Variant, string> = {
    primary: colors.primary,
    secondary: colors.surfaceAlt,
    danger: colors.danger,
    ghost: 'transparent',
    success: colors.bought,
  };

  const txtColor: Record<Variant, string> = {
    primary: '#FFFFFF',
    secondary: colors.textPrimary,
    danger: '#FFFFFF',
    ghost: colors.primary,
    success: '#FFFFFF',
  };

  const padY: Record<Size, number> = { sm: 8, md: 12, lg: 16 };
  const padX: Record<Size, number> = { sm: 14, md: 20, lg: 28 };
  const fontSize: Record<Size, number> = { sm: FONT_SIZE.sm, md: FONT_SIZE.md, lg: FONT_SIZE.base };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.78}
      disabled={isDisabled}
      style={[
        styles.base,
        {
          backgroundColor: bgColor[variant],
          paddingVertical: padY[size],
          paddingHorizontal: padX[size],
          borderRadius: RADIUS.md,
          opacity: isDisabled ? 0.5 : 1,
          borderWidth: variant === 'ghost' ? 1.5 : 0,
          borderColor: variant === 'ghost' ? colors.primary : undefined,
          alignSelf: fullWidth ? undefined : 'flex-start',
          width: fullWidth ? '100%' : undefined,
        },
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={txtColor[variant]} size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            { color: txtColor[variant], fontSize: fontSize[size] },
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: FONT_WEIGHT.semibold,
    letterSpacing: 0.3,
  },
});
