import { useState } from 'react';

import {
  StyleSheet,
  Text,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';

import { router } from 'expo-router';

import AuthInput from '../../components/auth/AuthInput';
import PrimaryButton from '../../components/auth/PrimaryButton';
import SocialButton from '../../components/auth/SocialButton';

import { COLORS } from '@/constants/colors';

export default function RegisterScreen() {

  // =========================
  // STATE
  // =========================

  const [fullName, setFullName] = useState('');

  const [email, setEmail] = useState('');

  const [phoneNumber, setPhoneNumber] = useState('');

  const [password, setPassword] = useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  // true = hiện mật khẩu
  // false = ẩn mật khẩu
  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);


  // =========================
  // REGISTER
  // =========================

  const handleRegister = () => {
    console.log(
      'Đăng ký:',
      fullName,
      email,
      phoneNumber,
      password,
      confirmPassword
    );
  };


  // =========================
  // UI
  // =========================

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

        {/* =========================
            ILLUSTRATION
        ========================= */}

        <Image
          source={require(
            '../../assets/images/register-illustration.png'
          )}
          style={styles.illustration}
        />


        {/* =========================
            TITLE
        ========================= */}

        <Text style={styles.title}>
          Đăng ký tài khoản
        </Text>

        <Text style={styles.subtitle}>
          Tạo tài khoản để mua sách, theo dõi đơn hàng
          {'\n'}
          và nhận nhiều ưu đãi hấp dẫn!
        </Text>


        {/* =========================
            FULL NAME
        ========================= */}

        <AuthInput
          icon="person-outline"
          placeholder="Họ và tên"
          value={fullName}
          onChangeText={setFullName}
        />


        {/* =========================
            EMAIL
        ========================= */}

        <AuthInput
          icon="mail-outline"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />


        {/* =========================
            PHONE
        ========================= */}

        <AuthInput
          icon="call-outline"
          placeholder="Số điện thoại"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
        />


        {/* =========================
            PASSWORD
        ========================= */}

        <AuthInput
          icon="lock-closed-outline"
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          isPassword={true}
          showPassword={showPassword}
          onTogglePassword={() =>
            setShowPassword(!showPassword)
          }
        />


        {/* =========================
            CONFIRM PASSWORD
        ========================= */}

        <AuthInput
          icon="lock-closed-outline"
          placeholder="Xác nhận mật khẩu"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          isPassword={true}
          showPassword={showConfirmPassword}
          onTogglePassword={() =>
            setShowConfirmPassword(
              !showConfirmPassword
            )
          }
        />


        {/* =========================
            REGISTER BUTTON
        ========================= */}

        <PrimaryButton
          title="Đăng ký"
          onPress={handleRegister}
        />


        {/* =========================
            OR
        ========================= */}

        <View style={styles.orContainer}>

          <View style={styles.line} />

          <Text style={styles.orText}>
            Hoặc
          </Text>

          <View style={styles.line} />

        </View>


        {/* =========================
            GOOGLE
        ========================= */}

        <SocialButton
          title="Đăng ký với Google"
          onPress={() => {
            console.log(
              'Đăng ký với Google'
            );
          }}
        />


        {/* =========================
            LOGIN
        ========================= */}

        <View style={styles.loginContainer}>

          <Text style={styles.loginNormal}>
            Bạn đã có tài khoản?
          </Text>

          <TouchableOpacity
            onPress={() =>
              router.push('/(auth)/login')
            }
          >
            <Text style={styles.loginLink}>
              {' '}Đăng nhập
            </Text>
          </TouchableOpacity>

        </View>

      </ScrollView>

    </KeyboardAvoidingView>
  );
}


// =========================
// STYLES
// =========================

const styles = StyleSheet.create({

  container: {
    flex: 1,

    backgroundColor:
      COLORS.background,
  },

  scrollContent: {
    paddingHorizontal: 24,

    paddingTop: 45,

    paddingBottom: 30,
  },

  illustration: {
    width: '100%',

    height: 175,

    resizeMode: 'contain',

    marginBottom: 8,
  },

  title: {
    fontSize: 28,

    fontWeight: 'bold',

    color: COLORS.text,

    marginBottom: 8,
  },

  subtitle: {
    fontSize: 15,

    color:
      COLORS.textSecondary,

    lineHeight: 22,

    marginBottom: 30,
  },

  orContainer: {
    flexDirection: 'row',

    alignItems: 'center',

    marginVertical: 20,
  },

  line: {
    flex: 1,

    height: 1,

    backgroundColor:
      COLORS.border,
  },

  orText: {
    marginHorizontal: 14,

    fontSize: 14,

    color:
      COLORS.textSecondary,
  },

  loginContainer: {
    flexDirection: 'row',

    justifyContent: 'center',

    marginTop: 24,
  },

  loginNormal: {
    fontSize: 14,

    color:
      COLORS.textSecondary,
  },

  loginLink: {
    fontSize: 14,

    fontWeight: '700',

    color:
      COLORS.primaryDark,
  },

});