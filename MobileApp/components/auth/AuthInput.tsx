
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '@/constants/colors';

type Props = {
  /** Nhãn hiển thị phía trên ô nhập */
  label?: string;
  /** Nếu true, sẽ hiện dấu * đỏ bên cạnh nhãn */
  required?: boolean;

  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;

  value: string;
  onChangeText: (text: string) => void;

  /** Dùng cho ô mật khẩu */
  isPassword?: boolean;
  /** Trạng thái đang hiện hay ẩn mật khẩu */
  showPassword?: boolean;
  /** Hàm được gọi khi bấm icon con mắt */
  onTogglePassword?: () => void;

  /** Thông báo lỗi validation — hiển thị chữ đỏ nhỏ bên dưới ô nhập */
  errorMessage?: string;
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
}: Props) {
  const hasError = !!errorMessage;

  return (
    <View style={styles.wrapper}>

      {/* Nhãn + dấu * */}
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.asterisk}> *</Text>}
        </View>
      )}

      {/* Ô nhập */}
      <View style={[styles.container, hasError && styles.containerError]}>

        {/* Icon bên trái */}
        <Ionicons
          name={icon}
          size={20}
          color={hasError ? COLORS.error : COLORS.textSecondary}
        />

        {/* Ô nhập dữ liệu */}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Icon con mắt */}
        {isPassword && onTogglePassword && (
          <TouchableOpacity
            onPress={onTogglePassword}
            hitSlop={10}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color={COLORS.textSecondary}
            />
          </TouchableOpacity>
        )}

      </View>

      {/* Thông báo lỗi — luôn chiếm đúng 1 dòng để layout không giật */}
      <Text style={[styles.errorText, !hasError && styles.errorHidden]}>
        {errorMessage ?? ' '}
      </Text>

    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 4,
  },

  /* Nhãn */
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  asterisk: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.error,
    lineHeight: 18,
  },

  /* Ô nhập */
  container: {
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
  },

  containerError: {
    borderColor: COLORS.error,
    backgroundColor: '#FFF5F5',
  },

  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: COLORS.text,
  },

  /* Lỗi */
  errorText: {
    marginTop: 4,
    marginLeft: 2,
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '500',
    minHeight: 18,
  },

  errorHidden: {
    color: 'transparent',
  },
});