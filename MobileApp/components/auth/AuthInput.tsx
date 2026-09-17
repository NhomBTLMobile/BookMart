// AuthInput — Dùng token từ Design System
// Validate real-time, label + dấu *, inline error message

import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '@/constants/colors';

type Props = {
  label?: string;
  required?: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  isPassword?: boolean;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  errorMessage?: string;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'numeric';
};

export default function AuthInput({
  label,
  required = false,
  icon,
  placeholder,
  value,
  onChangeText,
  isPassword = false,
  showPassword = false,
  onTogglePassword,
  errorMessage,
  keyboardType = 'default',
}: Props) {
  const hasError = !!errorMessage;

  return (
    <View style={styles.wrapper}>
      {/* Nhãn + dấu * bắt buộc */}
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.asterisk}> *</Text>}
        </View>
      )}

      {/* Ô nhập */}
      <View style={[styles.inputRow, hasError && styles.inputRowError]}>
        <Ionicons
          name={icon}
          size={19}
          color={hasError ? COLORS.error : COLORS.textHint}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textHint}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={keyboardType}
        />
        {isPassword && onTogglePassword && (
          <TouchableOpacity onPress={onTogglePassword} hitSlop={10} activeOpacity={0.7}>
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={19}
              color={COLORS.textHint}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Lỗi — luôn giữ 1 dòng để layout không giật */}
      <Text style={[styles.errorText, !hasError && styles.errorHidden]}>
        {errorMessage ?? ' '}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: SPACING.xs,
  },

  // ── Nhãn ──
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
  },
  asterisk: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.error,
    lineHeight: 18,
  },

  // ── Ô nhập ──
  inputRow: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  inputRowError: {
    borderColor: COLORS.error,
    backgroundColor: '#FFF5F5',
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZE.base,
    color: COLORS.text,
  },

  // ── Lỗi ──
  errorText: {
    marginTop: SPACING.xs - 2,
    marginLeft: 2,
    fontSize: FONT_SIZE.xs,
    color: COLORS.error,
    fontWeight: FONT_WEIGHT.medium,
    minHeight: 16,
  },
  errorHidden: {
    color: 'transparent',
  },
});