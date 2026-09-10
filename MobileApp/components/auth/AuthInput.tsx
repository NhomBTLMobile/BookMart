import React from 'react';

import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '@/constants/colors';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  placeholder: string;

  value: string;
  onChangeText: (text: string) => void;

  // Dùng cho ô mật khẩu
  isPassword?: boolean;

  // Trạng thái đang hiện hay ẩn mật khẩu
  showPassword?: boolean;

  // Hàm được gọi khi bấm icon con mắt
  onTogglePassword?: () => void;
};

export default function AuthInput({
  icon,
  placeholder,
  value,
  onChangeText,
  isPassword = false,
  showPassword = false,
  onTogglePassword,
}: Props) {
  return (
    <View style={styles.container}>

      {/* Icon bên trái */}
      <Ionicons
        name={icon}
        size={21}
        color={COLORS.textSecondary}
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
            name={
              showPassword
                ? 'eye-outline'
                : 'eye-off-outline'
            }
            size={21}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 54,

    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,

    paddingHorizontal: 16,

    backgroundColor: COLORS.surface,

    marginBottom: 14,
  },

  input: {
    flex: 1,

    marginLeft: 12,

    fontSize: 15,

    color: COLORS.text,
  },
});