import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, Platform, ScrollView, KeyboardAvoidingView ,TouchableOpacity,View, Image } from 'react-native';
import { router } from 'expo-router';
import AuthInput from '../../components/auth/AuthInput';
import PrimaryButton from '../../components/auth/PrimaryButton';
import SocialButton from '../../components/auth/SocialButton';
import { COLORS } from '@/constants/colors';

export default function RegisterScreen() {
  const[fullName, setFullName] = useState('');
  const[email, setEmail] = useState('');
  const[phoneNumber, setPhoneNumber] = useState('');
  const[password, setPassword] = useState('');
  const[showPassword, setShowPassword] = useState(false);
  const[confirmPassword, setConfirmPassword] = useState('');
  const[showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRegister = () => {
    // Xử lý gửi API đăng ký tài khoản
    console.log('Đăng ký:', fullName, email, password);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios'? 'padding': undefined}>
      <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled">
      
      <Image source={require('../../assets/images/register-illustration.png')} style={styles.illustration}/>
      <Text style={styles.title}>
        Đăng ký tài khoản
      </Text>
      <Text style={styles.subtitle}>
        Tạo tài khoản để mua sách, theo dõi đơn hàng
          {'\n'}
          và nhận nhiều ưu đãi hấp dẫn!
      </Text>
      <AuthInput icon="person-outline" 
        placeholder='Họ và tên' value={fullName}
        onChangeText={setFullName}/>
      <AuthInput 
        icon = "call-outline"
        placeholder='Số điện thoại' 
        value={phoneNumber}
        onChangeText={setPhoneNumber}
      />
      <AuthInput 
        icon = "lock-closed-outline"
        placeholder='Mật khẩu' 
        value={password}
        onChangeText={setPassword}
        secureTextEntry={!showPassword}
        showPassword={showPassword}
        onTongglePassword={() => setShowPassword(!showPassword)}
      />
      <AuthInput 
        icon = "lock-closed-outline"
        placeholder='Xác nhận mật khẩu' 
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showConfirmPassword}
        showPassword={showConfirmPassword}
        onTongglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
      />
      <PrimaryButton 
        title="Đăng ký"
        onPress={() => {console.log('Đăng ký')}}
      />
      <View style={styles.orContainer}>
        <View style={styles.line}/>
        <Text style={styles.orText}>Hoặc</Text>
        <View style={styles.line}/>
      </View>
      <SocialButton
        title="Đăng ký với Google"
        onPress={() => {console.log('Đăng ký với Google')}}
      />

      <View style={styles.loginContainer}>
        <Text style={styles.loginNormal}>
          Bạn đã có tài khoản?
        </Text>
        <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
          <Text style={styles.loginLink}>
            {' '}Đăng nhập
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
    paddingTop: 45,
    paddingBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle:{
    fontSize: 15,
    color: COLORS.textSecondary,
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

    backgroundColor: COLORS.border,
  },

  orText: {
    marginHorizontal: 14,

    fontSize: 14,

    color: COLORS.textSecondary,
  },

  loginContainer: {
    flexDirection: 'row',

    justifyContent: 'center',

    marginTop: 24,
  },

  loginNormal: {
    fontSize: 14,

    color: COLORS.textSecondary,
  },

  loginLink: {
    fontSize: 14,

    fontWeight: '700',

    color: COLORS.primaryDark,
  },
})