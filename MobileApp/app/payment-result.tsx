import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING } from '@/constants/colors';

export default function PaymentResultScreen() {
  const { status, orderId } = useLocalSearchParams();

  const isSuccess = status === 'success';

  return (
    <View style={s.container}>
      <View style={s.iconWrap}>
        <Ionicons 
          name={isSuccess ? "checkmark-circle" : "close-circle"} 
          size={80} 
          color={isSuccess ? COLORS.success : COLORS.error} 
        />
      </View>
      <Text style={s.title}>
        {isSuccess ? 'Thanh toán thành công' : 'Thanh toán thất bại'}
      </Text>
      <Text style={s.subTitle}>
        {isSuccess 
          ? `Đơn hàng #${orderId} của bạn đã được thanh toán thành công.` 
          : 'Đã có lỗi xảy ra hoặc bạn đã hủy thanh toán.'}
      </Text>

      <TouchableOpacity 
        style={s.btn} 
        onPress={() => {
          if (isSuccess) {
            router.replace({ pathname: '/order-success', params: { orderId: orderId as string, total: '0' } });
          } else {
            router.replace({ pathname: `/order/${orderId}` });
          }
        }}
      >
        <Text style={s.btnText}>{isSuccess ? 'Xem đơn hàng' : 'Xem chi tiết đơn hàng'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  iconWrap: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subTitle: {
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  btn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  btnText: {
    color: COLORS.white,
    fontWeight: FONT_WEIGHT.bold,
    fontSize: FONT_SIZE.md,
  }
});
