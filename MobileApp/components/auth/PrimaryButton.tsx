// PrimaryButton — Fitts's Law: chiều cao 54px, full width, dễ nhấn
// Aesthetic-Usability: bo góc 14, font bold, màu brand

import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, FONT_SIZE, FONT_WEIGHT } from '@/constants/colors';

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'outline';
};

export default function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
}: Props) {
  const isPrimary = variant === 'primary';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isPrimary ? styles.primary : styles.outline,
        (disabled || loading) && styles.disabled,
      ]}
      activeOpacity={0.82}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? COLORS.white : COLORS.primary} size="small" />
      ) : (
        <Text style={[styles.text, !isPrimary && styles.textOutline]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  primary: {
    backgroundColor: COLORS.primary,
    // Subtle shadow for depth
    shadowColor: COLORS.primaryDark,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  disabled: {
    opacity: 0.55,
  },
  text: {
    color: COLORS.white,
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    letterSpacing: 0.3,
  },
  textOutline: {
    color: COLORS.primary,
  },
});
