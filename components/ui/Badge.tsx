import React from 'react';
import { Text, StyleSheet, ViewStyle, TextStyle, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { RADIUS, SPACING, FONT_SIZE, FONT_WEIGHT } from '../../constants/theme';

type BadgeVariant = 'bought' | 'notBought' | 'weekly' | 'monthly' | 'primary' | 'accent';

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md';
}

export default function Badge({ label, variant, style, textStyle, size = 'md' }: BadgeProps) {
  const { colors } = useTheme();

  const bgMap: Record<BadgeVariant, string> = {
    bought: colors.boughtBg,
    notBought: colors.notBoughtBg,
    weekly: colors.weeklyBg,
    monthly: colors.monthlyBg,
    primary: colors.primary + '22',
    accent: colors.accent + '22',
  };

  const colorMap: Record<BadgeVariant, string> = {
    bought: colors.bought,
    notBought: colors.notBought,
    weekly: colors.weekly,
    monthly: colors.monthly,
    primary: colors.primary,
    accent: colors.accent,
  };

  const borderMap: Record<BadgeVariant, string> = {
    bought: colors.bought + '44',
    notBought: colors.notBought + '44',
    weekly: colors.weekly + '44',
    monthly: colors.monthly + '44',
    primary: colors.primary + '44',
    accent: colors.accent + '44',
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgMap[variant],
          borderColor: borderMap[variant],
          paddingHorizontal: size === 'sm' ? SPACING.sm : SPACING.md,
          paddingVertical: size === 'sm' ? 3 : SPACING.xs,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: colorMap[variant],
            fontSize: size === 'sm' ? FONT_SIZE.xs : FONT_SIZE.sm,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: RADIUS.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: FONT_WEIGHT.semibold,
    letterSpacing: 0.4,
  },
});
