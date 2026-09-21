// REGISTER SCREEN
// ─────────────────────────────────────────────
// Tâm lý học áp dụng:
// • Progress Illusion   — bước/bước chia nhóm form theo "Thông tin cá nhân" / "Bảo mật"
//                         giúp người dùng cảm thấy đang tiến tới đích (Goal Gradient Effect)
// • Chunking            — chia 5 field thành 2 nhóm nhỏ → giảm Cognitive Load
// • Real-time Feedback  — lỗi hiện ngay khi gõ → không cần chờ submit để biết sai
// • Social Proof        — Google signup ở cuối (quen thuộc, an tâm)
// • Reciprocity         — hiện rõ "lợi ích" khi đăng ký ở subtitle
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
const isValidPhone = (v: string) => /^0\d{9}$/.test(v.trim());

const validateFullName  = (v: string) => !v.trim() ? 'Vui lòng nhập họ và tên' : v.trim().length < 2 ? 'Ít nhất 2 ký tự' : '';
const validateEmail     = (v: string) => !v.trim() ? 'Vui lòng nhập email' : !isValidEmail(v) ? 'Email không đúng định dạng' : '';
const validatePhone     = (v: string) => !v.trim() ? 'Vui lòng nhập số điện thoại' : !isValidPhone(v) ? 'Số điện thoại không đúng (10 số, bắt đầu 0)' : '';
const validatePassword  = (v: string) => !v ? 'Vui lòng nhập mật khẩu' : v.length < 6 ? 'Mật khẩu phải có ít nhất 6 ký tự' : '';
const validateConfirm   = (v: string, pw: string) => !v ? 'Vui lòng xác nhận mật khẩu' : v !== pw ? 'Mật khẩu xác nhận không khớp' : '';
// ─────────────────────────────────────────────────────────────

export default function RegisterScreen() {
  const [fullName, setFullName]               = useState('');
  const [email, setEmail]                     = useState('');
  const [phoneNumber, setPhoneNumber]         = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword]               = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullNameError, setFullNameError]             = useState('');
  const [emailError, setEmailError]                   = useState('');
  const [phoneError, setPhoneError]                   = useState('');
  const [passwordError, setPasswordError]             = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // ── Handlers: validate real-time khi gõ ──────────────────
  const handleFullNameChange = (t: string) => { setFullName(t); setFullNameError(validateFullName(t)); };
  const handleEmailChange    = (t: string) => { setEmail(t); setEmailError(validateEmail(t)); };
  const handlePhoneChange    = (t: string) => { setPhoneNumber(t); setPhoneError(validatePhone(t)); };
  const handlePasswordChange = (t: string) => {
    setPassword(t);
    setPasswordError(validatePassword(t));
    if (confirmPassword) setConfirmPasswordError(validateConfirm(confirmPassword, t));
  };
  const handleConfirmChange  = (t: string) => { setConfirmPassword(t); setConfirmPasswordError(validateConfirm(t, password)); };

  // ── Submit ────────────────────────────────────────────────
  const handleRegister = () => {
    const fnErr = validateFullName(fullName);
    const eErr  = validateEmail(email);
    const phErr = validatePhone(phoneNumber);
    const pErr  = validatePassword(password);
    const cpErr = validateConfirm(confirmPassword, password);

    setFullNameError(fnErr);
    setEmailError(eErr);
    setPhoneError(phErr);
    setPasswordError(pErr);
    setConfirmPasswordError(cpErr);

    if (fnErr || eErr || phErr || pErr || cpErr) return;
    console.log('Đăng ký:', fullName, email, phoneNumber);
    // TODO: gọi API
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
          <Text style={styles.title}>Tạo tài khoản</Text>
          {/* Reciprocity: nêu rõ lợi ích → tăng động lực điền form */}
          <Text style={styles.subtitle}>
            Đăng ký để mua sách, theo dõi đơn hàng{'\n'}
            và nhận ưu đãi độc quyền dành cho thành viên 🎁
          </Text>
        </View>

        {/* ── FORM ── */}
        <View style={styles.card}>
          <AuthInput
            label="Họ và tên"
            required
            icon="person-outline"
            placeholder="Nhập họ và tên đầy đủ"
            value={fullName}
            onChangeText={handleFullNameChange}
            errorMessage={fullNameError}
          />
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
            label="Số điện thoại"
            required
            icon="call-outline"
            placeholder="Nhập số điện thoại (10 chữ số)"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={handlePhoneChange}
            errorMessage={phoneError}
          />
          <AuthInput
            label="Mật khẩu"
            required
            icon="lock-closed-outline"
            placeholder="Ít nhất 6 ký tự"
            isPassword
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword((p) => !p)}
            value={password}
            onChangeText={handlePasswordChange}
            errorMessage={passwordError}
          />
          <AuthInput
            label="Xác nhận mật khẩu"
            required
            icon="lock-closed-outline"
            placeholder="Nhập lại mật khẩu"
            isPassword
            showPassword={showConfirmPassword}
            onTogglePassword={() => setShowConfirmPassword((p) => !p)}
            value={confirmPassword}
            onChangeText={handleConfirmChange}
            errorMessage={confirmPasswordError}
          />
        </View>

        {/* ── CTA ── */}
        <PrimaryButton title="Tạo tài khoản" onPress={handleRegister} />

        {/* ── DIVIDER ── */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Hoặc đăng ký với</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* ── SOCIAL PROOF ── */}
        <SocialButton title="Google" onPress={() => console.log('Google register')} />

        {/* ── LOGIN LINK ── */}
        <View style={styles.loginRow}>
          <Text style={styles.loginNormal}>Đã có tài khoản?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginLink}> Đăng nhập</Text>
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
    paddingTop: SPACING['4xl'],
    paddingBottom: SPACING['3xl'],
  },

  // ── Hero ──
  hero: {
    alignItems: 'center',
    marginBottom: SPACING['2xl'],
  },
  logo: {
    width: 180,
    height: 80,
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
    lineHeight: 21,
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

  // ── Login link ──
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  loginNormal: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  loginLink: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primaryDark,
  },
});
