import { useState } from 'react';

import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { router } from 'expo-router';

import AuthInput from '../../components/auth/AuthInput';
import PrimaryButton from '../../components/auth/PrimaryButton';
import SocialButton from '../../components/auth/SocialButton';

import { COLORS } from '../../constants/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* Illustration */}
        <Image
          source={require('../../assets/images/login-illustration.png')}
          style={styles.illustration}
        />

        {/* Title */}
        <Text style={styles.title}>
          Đăng nhập
        </Text>

        <Text style={styles.subtitle}>
          Chào mừng bạn quay trở lại!
          {'\n'}
          Cùng tiếp tục hành trình khám phá
          tri thức nhé!
        </Text>

        {/* Email */}
        <AuthInput
          icon="mail-outline"
          placeholder="Email hoặc số điện thoại"
          value={email}
          onChangeText={setEmail}
        />

        {/* Password */}
        <AuthInput
          icon="lock-closed-outline"
          placeholder="Mật khẩu"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Forgot password */}
        <TouchableOpacity
          style={styles.forgotWrapper}
          onPress={() => {}}
        >
          <Text style={styles.forgotText}>
            Quên mật khẩu?
          </Text>
        </TouchableOpacity>

        {/* Login button */}
        <PrimaryButton
          title="Đăng nhập"
          onPress={() => {
            console.log('Login');
          }}
        />

        {/* Or */}
        <View style={styles.orContainer}>
          <View style={styles.line} />

          <Text style={styles.orText}>
            Hoặc
          </Text>

          <View style={styles.line} />
        </View>

        {/* Google */}
        <SocialButton
          title="Đăng nhập bằng Google"
          onPress={() => {
            console.log('Google login');
          }}
        />

        {/* Register */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerNormal}>
            Chưa có tài khoản?
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/(auth)/register')}
          >
            <Text style={styles.registerLink}>
              {' '}Đăng ký
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 55,
    paddingBottom: 30,
  },

  illustration: {
    width: '100%',
    height: 190,
    resizeMode: 'contain',
    marginBottom: 12,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.text,

    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 23,

    color: COLORS.textSecondary,

    marginBottom: 26,
  },

  forgotWrapper: {
    alignItems: 'flex-end',
    marginTop: -2,
    marginBottom: 20,
  },

  forgotText: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: '600',
  },

  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',

    marginVertical: 20,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },

  orText: {
    marginHorizontal: 14,

    fontSize: 14,
    color: COLORS.textSecondary,
  },

  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',

    marginTop: 24,
  },

  registerNormal: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },

  registerLink: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: '700',
  },
});