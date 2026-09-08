import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, Platform, ScrollView, KeyboardAvoidingView ,TouchableOpacity, View, Image } from 'react-native';
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
  }
})