// LOGIN SCREEN
// ─────────────────────────────────────────────
// Tâm lý học áp dụng:
// • Anchoring Effect    — Logo + tagline đầu trang tạo ấn tượng brand đầu tiên
// • Trust Signal        — "Đăng nhập bằng Google" = xã hội chứng nhận (Social Proof)
// • Loss Aversion       — "Quên mật khẩu?" ngay dưới ô mật khẩu → giảm ma sát
// • Visual Hierarchy    — Title lớn → Label → Input → Button (mắt đọc top-down)
// • Fitts's Law         — Button 54px full-width, dễ nhấn bằng ngón cái
// ─────────────────────────────────────────────

import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';

import AuthInput from '@/components/auth/AuthInput';
import PrimaryButton from '@/components/auth/PrimaryButton';
import SocialButton from '@/components/auth/SocialButton';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS } from '@/constants/colors';

// ─── Validators ──────────────────────────────────────────────
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const validateEmail = (v: string) => {
  if (!v.trim()) return 'Vui lòng nhập email';
  if (!isValidEmail(v)) return 'Email không đúng định dạng';
  return '';
};
const validatePassword = (v: string) => {
  if (!v) return 'Vui lòng nhập mật khẩu';
  if (v.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
  return '';
};
// ─────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setEmailError(validateEmail(text));
  };
  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordError(validatePassword(text));
  };

  const handleLogin = () => {
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    if (email === 'test@gmail.com' && password === '123456') {
      router.replace('/(tabs)');
    } else {
      setEmailError('Email hoặc mật khẩu không chính xác');
      setPasswordError('Email hoặc mật khẩu không chính xác');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── HERO / ANCHOR ── */}
        <View style={styles.hero}>
          <Image
            source={require('../../assets/images/bookmart_logo.png')}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.title}>Đăng nhập</Text>
          <Text style={styles.subtitle}>
            Chào mừng bạn quay trở lại!{'\n'}
            Cùng tiếp tục hành trình khám phá tri thức nhé!
          </Text>
        </View>

        {/* ── FORM ── */}
        <View style={styles.card}>
          <AuthInput
            label="Email"
            required
            icon="mail-outline"
            placeholder="Nhập địa chỉ email"
            keyboardType="email-address"
            value={email}
            onChangeText={handleEmailChange}
            errorMessage={emailError}
          />

          <AuthInput
            label="Mật khẩu"
            required
            icon="lock-closed-outline"
            placeholder="Nhập mật khẩu"
            isPassword
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword((p) => !p)}
            value={password}
            onChangeText={handlePasswordChange}
            errorMessage={passwordError}
          />

          {/* Loss Aversion: giảm rào cản khi quên mật khẩu */}
          <TouchableOpacity style={styles.forgotRow} onPress={() => {}}>
            <Text style={styles.forgotText}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <PrimaryButton title="Đăng nhập" onPress={handleLogin} />
        </View>

        {/* ── DIVIDER ── */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Hoặc đăng nhập với</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* ── SOCIAL PROOF ── */}
        <SocialButton title="Google" onPress={() => console.log('Google login')} />

        {/* ── REGISTER LINK ── */}
        <View style={styles.registerRow}>
          <Text style={styles.registerNormal}>Chưa có tài khoản?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.registerLink}> Đăng ký ngay</Text>
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
  scroll: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING['5xl'],
    paddingBottom: SPACING['3xl'],
  },

  // ── Hero ──
  hero: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  logo: {
    width: 200,
    height: 88,
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZE['3xl'],
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Card form ──
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    shadowColor: '#183C27',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14,
    elevation: 3,
  },

  // ── Forgot ──
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: -SPACING.xs,
    marginBottom: SPACING.lg,
  },
  forgotText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primaryDark,
  },

  // ── Divider ──
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.lg,
    gap: SPACING.md,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.divider,
  },
  dividerText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },

  // ── Register link ──
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  registerNormal: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  registerLink: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primaryDark,
  },
});
