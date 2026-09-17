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

import { COLORS } from "../../constants/colors";

// ─── Helpers ────────────────────────────────────────────────────────────────
const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const validateEmail = (v: string): string => {
  if (!v.trim()) return "Vui lòng nhập email";
  if (!isValidEmail(v)) return "Email không đúng định dạng";
  return "";
};

const validatePassword = (v: string): string => {
  if (!v) return "Vui lòng nhập mật khẩu";
  if (v.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
  return "";
};
// ─────────────────────────────────────────────────────────────────────────────

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Validate real-time khi gõ
  const handleEmailChange = (text: string) => {
    setEmail(text);
    setEmailError(validateEmail(text));
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordError(validatePassword(text));
  };

  const handleLogin = () => {
    // Validate toàn bộ trước khi gửi (phòng khi chưa chạm ô nào)
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) return;

    if (email === "test@gmail.com" && password === "123456") {
      console.log("Đang đăng nhập với: ", email, password);
      router.replace("/(tabs)");
    } else {
      setEmailError("Email hoặc mật khẩu không chính xác");
      setPasswordError("Email hoặc mật khẩu không chính xác");
    }
  };

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
        <Text style={styles.title}>Đăng nhập</Text>

        <Text style={styles.subtitle}>
          Chào mừng bạn quay trở lại!
          {"\n"}
          Cùng tiếp tục hành trình khám phá tri thức nhé!
        </Text>

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

        {/* Password */}
        <AuthInput
          label="Mật khẩu"
          required
          icon="lock-closed-outline"
          placeholder="Nhập mật khẩu"
          isPassword
          showPassword={showPassword}
          onTogglePassword={() => setShowPassword((prev) => !prev)}
          value={password}
          onChangeText={handlePasswordChange}
          errorMessage={passwordError}
        />

        {/* Forgot password */}
        <TouchableOpacity style={styles.forgotWrapper} onPress={() => { }}>
          <Text style={styles.forgotText}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        {/* Login button */}
        <PrimaryButton title="Đăng nhập" onPress={handleLogin} />

        {/* Or */}
        <View style={styles.orContainer}>
          <View style={styles.line} />
          <Text style={styles.orText}>Hoặc</Text>
          <View style={styles.line} />
        </View>

        {/* Google */}
        <SocialButton
          title="Đăng nhập bằng Google"
          onPress={() => {
            console.log("Google login");
          }}
        />

        {/* Register */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerNormal}>Chưa có tài khoản?</Text>
          <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
            <Text style={styles.registerLink}> Đăng ký</Text>
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
    fontSize: 30,
    fontWeight: "800",
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
    alignItems: "flex-end",
    marginTop: -4,
    marginBottom: 20,
  },

  forgotText: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: "600",
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

  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },

  registerNormal: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },

  registerLink: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: "700",
  },
});
