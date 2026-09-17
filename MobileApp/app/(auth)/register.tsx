import { useState } from "react";

import { Image } from "expo-image";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { router } from "expo-router";

import AuthInput from "../../components/auth/AuthInput";
import PrimaryButton from "../../components/auth/PrimaryButton";
import SocialButton from "../../components/auth/SocialButton";

import { COLORS } from "@/constants/colors";

// ─── Helpers ────────────────────────────────────────────────────────────────
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const isValidPhone = (v: string) => /^0\d{9}$/.test(v.trim());

const validateFullName = (v: string): string => {
  if (!v.trim()) return "Vui lòng nhập họ và tên";
  if (v.trim().length < 2) return "Họ và tên phải có ít nhất 2 ký tự";
  return "";
};

const validateEmail = (v: string): string => {
  if (!v.trim()) return "Vui lòng nhập email";
  if (!isValidEmail(v)) return "Email không đúng định dạng";
  return "";
};

const validatePhone = (v: string): string => {
  if (!v.trim()) return "Vui lòng nhập số điện thoại";
  if (!isValidPhone(v)) return "Số điện thoại không đúng định dạng (10 chữ số, bắt đầu bằng 0)";
  return "";
};

const validatePassword = (v: string): string => {
  if (!v) return "Vui lòng nhập mật khẩu";
  if (v.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
  return "";
};

const validateConfirmPassword = (v: string, password: string): string => {
  if (!v) return "Vui lòng xác nhận mật khẩu";
  if (v !== password) return "Mật khẩu xác nhận không khớp";
  return "";
};
// ─────────────────────────────────────────────────────────────────────────────

export default function RegisterScreen() {
  // ─── State ─────────────────────────────────────────────────────────────────
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [fullNameError, setFullNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  // ─── Handlers (validate real-time khi gõ) ──────────────────────────────────
  const handleFullNameChange = (text: string) => {
    setFullName(text);
    setFullNameError(validateFullName(text));
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    setEmailError(validateEmail(text));
  };

  const handlePhoneChange = (text: string) => {
    setPhoneNumber(text);
    setPhoneError(validatePhone(text));
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordError(validatePassword(text));
    // Cập nhật lại lỗi xác nhận nếu đã có giá trị
    if (confirmPassword) {
      setConfirmPasswordError(validateConfirmPassword(confirmPassword, text));
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    setConfirmPasswordError(validateConfirmPassword(text, password));
  };

  // ─── Register ──────────────────────────────────────────────────────────────
  const handleRegister = () => {
    // Validate toàn bộ trước khi gửi (phòng khi chưa chạm ô nào)
    const fnErr = validateFullName(fullName);
    const eErr  = validateEmail(email);
    const phErr = validatePhone(phoneNumber);
    const pErr  = validatePassword(password);
    const cpErr = validateConfirmPassword(confirmPassword, password);

    setFullNameError(fnErr);
    setEmailError(eErr);
    setPhoneError(phErr);
    setPasswordError(pErr);
    setConfirmPasswordError(cpErr);

    if (fnErr || eErr || phErr || pErr || cpErr) return;

    console.log("Đăng ký:", fullName, email, phoneNumber, password);
    // TODO: gọi API đăng ký
  };

  // ─── UI ────────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/bookmart_logo.png")}
            style={styles.logo}
            contentFit="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Đăng ký tài khoản</Text>

        <Text style={styles.subtitle}>
          Tạo tài khoản để mua sách, theo dõi đơn hàng
          {"\n"}
          và nhận nhiều ưu đãi hấp dẫn!
        </Text>

        {/* Họ và tên */}
        <AuthInput
          label="Họ và tên"
          required
          icon="person-outline"
          placeholder="Nhập họ và tên"
          value={fullName}
          onChangeText={handleFullNameChange}
          errorMessage={fullNameError}
        />

        {/* Email */}
        <AuthInput
          label="Email"
          required
          icon="mail-outline"
          placeholder="Nhập địa chỉ email"
          value={email}
          onChangeText={handleEmailChange}
          errorMessage={emailError}
        />

        {/* Số điện thoại */}
        <AuthInput
          label="Số điện thoại"
          required
          icon="call-outline"
          placeholder="Nhập số điện thoại"
          value={phoneNumber}
          onChangeText={handlePhoneChange}
          errorMessage={phoneError}
        />

        {/* Mật khẩu */}
        <AuthInput
          label="Mật khẩu"
          required
          icon="lock-closed-outline"
          placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
          value={password}
          onChangeText={handlePasswordChange}
          isPassword
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword((prev) => !prev)}
          errorMessage={passwordError}
        />

        {/* Xác nhận mật khẩu */}
        <AuthInput
          label="Xác nhận mật khẩu"
          required
          icon="lock-closed-outline"
          placeholder="Nhập lại mật khẩu"
          value={confirmPassword}
          onChangeText={handleConfirmPasswordChange}
          isPassword
          showPassword={showConfirmPassword}
          onTogglePassword={() => setShowConfirmPassword((prev) => !prev)}
          errorMessage={confirmPasswordError}
        />

        {/* Register button */}
        <PrimaryButton title="Đăng ký" onPress={handleRegister} />

        {/* Or */}
        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>Hoặc</Text>
          <View style={styles.line} />
        </View>

        {/* Google */}
        <SocialButton
          title="Đăng ký với Google"
          onPress={() => {
            console.log("Đăng ký với Google");
          }}
        />

        {/* Login link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginNormal}>Bạn đã có tài khoản?</Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.loginLink}> Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 30,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 10,
  },

  logo: {
    width: 220,
    height: 100,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: 26,
  },

  orContainer: {
    flexDirection: "row",
    alignItems: "center",
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

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },

  loginNormal: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  loginLink: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.primaryDark,
  },
});
