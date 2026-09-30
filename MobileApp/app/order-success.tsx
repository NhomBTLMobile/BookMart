import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, BackHandler, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOW, SPACING } from '../constants/colors';

// ─── Lợi ích UX của trang độc lập ──────────────────────────────────────────
// 1. Peak-End Rule: Kết thúc một flow mua hàng bằng một màn hình rực rỡ, rõ ràng.
// 2. Không cho phép Back: Ngăn chặn việc lùi lại trang thanh toán sau khi đã thành công (tránh double charge).
// 3. Clear Call-to-Action: Điều hướng người dùng tiếp tục mua sắm hoặc xem đơn.
// ──────────────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString('vi-VN') + 'đ';

export default function OrderSuccessScreen() {
  const { orderId, total } = useLocalSearchParams<{ orderId: string; total: string }>();

  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    // Chạy animation khi vào trang
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 12, stiffness: 120 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideUpAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();

    // Ngăn chặn nút Back cứng trên Android (đã thanh toán không cho lùi lại checkout)
    const backAction = () => {
      router.replace('/(tabs)');
      return true; // Chặn hành vi mặc định
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, []);

  return (
    <View style={styles.container}>
      {/* ── Content ── */}
      <Animated.View style={[styles.content, { opacity: opacityAnim, transform: [{ translateY: slideUpAnim }] }]}>

        {/* Icon Success with Scale Animation */}
        <Animated.View style={[styles.iconWrap, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.iconRing}>
            <Ionicons name="checkmark-circle" size={80} color={COLORS.primary} />
          </View>
        </Animated.View>

        <Text style={styles.title}>Đặt hàng thành công! 🎉</Text>
        <Text style={styles.subtitle}>
          Cảm ơn bạn đã tin tưởng BookMart.{'\n'}
          Đơn hàng của bạn đang được xử lý.
        </Text>

        {/* Thông tin tóm tắt đơn hàng */}
        <View style={styles.orderInfoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã đơn hàng</Text>
            <Text style={styles.infoValue}>#{orderId}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tổng thanh toán</Text>
            <Text style={[styles.infoValue, { color: COLORS.primaryDark, fontSize: FONT_SIZE.lg }]}>
              {fmt(Number(total || 0))}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dự kiến giao hàng</Text>
            <Text style={styles.infoValue}>3 – 5 ngày làm việc</Text>
          </View>
        </View>

      </Animated.View>

      {/* ── Footer Actions ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryBtn}
          activeOpacity={0.8}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.primaryBtnText}>Tiếp tục mua sắm</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          activeOpacity={0.7}
          onPress={() => router.replace({ pathname: '/order/[id]', params: { id: orderId } })}
        >
          <Ionicons name="receipt-outline" size={18} color={COLORS.primaryDark} />
          <Text style={styles.secondaryBtnText}>Xem chi tiết đơn hàng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING['3xl'],
  },

  iconWrap: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },
  iconRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.md,
  },

  title: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SPACING['2xl'],
  },

  orderInfoCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOW.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.xs,
  },

  footer: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING['3xl'], // Safe area bottom
    paddingTop: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  primaryBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOW.md,
  },
  primaryBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    paddingVertical: SPACING.md,
  },
  secondaryBtnText: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primaryDark,
  },
});
