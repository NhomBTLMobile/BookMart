// CHECKOUT SCREEN
// ─────────────────────────────────────────────
// Tâm lý học áp dụng:
// • Commitment & Consistency  — hiển thị lại các sách đã chọn → khó bỏ cuộc
// • Authority                 — icon bảo mật SSL, "Thanh toán an toàn"
// • Social Proof              — badge "Giao hàng đảm bảo"
// • Progress Indicator        — step bar (Giỏ hàng → Thanh toán → Hoàn thành)
// • Loss Aversion             — hiển thị tiết kiệm được bao nhiêu
// • Fitts's Law               — nút xác nhận full-width, dễ nhấn
// ─────────────────────────────────────────────

import {
  COLORS,
  FONT_SIZE,
  FONT_WEIGHT,
  RADIUS,
  SHADOW,
  SPACING,
} from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── Types ───────────────────────────────────────────────────
type PaymentMethod = 'cod' | 'vnpay';

type OrderItem = {
  id: string;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  image: any;
  quantity: number;
};

type Address = {
  name: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  city: string;
};

// ─── Mock Data ───────────────────────────────────────────────
const ORDER_ITEMS: OrderItem[] = [
  {
    id: '1',
    title: 'Đắc Nhân Tâm',
    author: 'Dale Carnegie',
    price: 89_000,
    originalPrice: 112_000,
    image: require('../assets/images/book1.jpg'),
    quantity: 1,
  },
  {
    id: '2',
    title: 'Nhà Giả Kim',
    author: 'Paulo Coelho',
    price: 55_000,
    originalPrice: 74_000,
    image: require('../assets/images/book2.jpg'),
    quantity: 2,
  },
  {
    id: '3',
    title: 'Tôi thấy hoa vàng trên cỏ xanh',
    author: 'Nguyễn Nhật Ánh',
    price: 65_000,
    image: require('../assets/images/book3.jpg'),
    quantity: 1,
  },
];

const SAVED_ADDRESS: Address = {
  name: 'Nguyễn Văn An',
  phone: '0901 234 567',
  address: '123 Đường Lê Lợi',
  ward: 'Phường Bến Nghé',
  district: 'Quận 1',
  city: 'TP. Hồ Chí Minh',
};

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; sub: string; icon: string; color: string }[] = [
  { id: 'cod',    label: 'Tiền mặt (COD)', sub: 'Thanh toán khi nhận hàng',    icon: 'cash-outline',   color: '#3E9B4F' },
  { id: 'vnpay', label: 'VNPay',           sub: 'Thanh toán qua cổng VNPay',   icon: 'qr-code-outline', color: '#1A56DB' },
];

// ─── Helpers ─────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString('vi-VN') + 'đ';

// ─── Step Indicator ──────────────────────────────────────────
function StepBar({ current }: { current: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: 'Giỏ hàng' },
    { n: 2, label: 'Thanh toán' },
    { n: 3, label: 'Hoàn thành' },
  ];
  return (
    <View style={s.stepBar}>
      {steps.map((step, idx) => {
        const done = current > step.n;
        const active = current === step.n;
        return (
          <View key={step.n} style={s.stepItem}>
            <View style={[s.stepCircle, done && s.stepDone, active && s.stepActive]}>
              {done
                ? <Ionicons name="checkmark" size={13} color={COLORS.white} />
                : <Text style={[s.stepNum, active && { color: COLORS.white }]}>{step.n}</Text>
              }
            </View>
            <Text style={[s.stepLabel, active && s.stepLabelActive]}>{step.label}</Text>
            {idx < steps.length - 1 && (
              <View style={[s.stepLine, done && s.stepLineDone]} />
            )}
          </View>
        );
      })}
    </View>
  );
}

// ─── Section Header ──────────────────────────────────────────
function SectionHeader({ icon, title }: { icon: any; title: string }) {
  return (
    <View style={s.sectionHeader}>
      <View style={s.sectionIconWrap}>
        <Ionicons name={icon} size={16} color={COLORS.primary} />
      </View>
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

// ─── Success Modal ────────────────────────────────────────────
function SuccessModal({ visible, orderId, total, onClose }: {
  visible: boolean;
  orderId: string;
  total: number;
  onClose: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  if (visible) {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, damping: 14, stiffness: 200 }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
  }

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={s.modalOverlay}>
        <Animated.View style={[s.modalCard, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
          {/* Icon thành công */}
          <View style={s.successIconWrap}>
            <View style={s.successIconRing}>
              <Ionicons name="checkmark-circle" size={56} color={COLORS.primary} />
            </View>
          </View>

          <Text style={s.successTitle}>Đặt hàng thành công! 🎉</Text>
          <Text style={s.successSub}>
            Cảm ơn bạn đã tin tưởng BookMart.{'\n'}
            Đơn hàng của bạn đang được xử lý.
          </Text>

          {/* Thông tin đơn */}
          <View style={s.successInfo}>
            <View style={s.successRow}>
              <Text style={s.successInfoLabel}>Mã đơn hàng</Text>
              <Text style={s.successInfoValue}>#{orderId}</Text>
            </View>
            <View style={s.successDivider} />
            <View style={s.successRow}>
              <Text style={s.successInfoLabel}>Tổng thanh toán</Text>
              <Text style={[s.successInfoValue, { color: COLORS.primaryDark }]}>{fmt(total)}</Text>
            </View>
            <View style={s.successDivider} />
            <View style={s.successRow}>
              <Text style={s.successInfoLabel}>Dự kiến giao hàng</Text>
              <Text style={s.successInfoValue}>3 – 5 ngày làm việc</Text>
            </View>
          </View>

          {/* Nút hành động */}
          <TouchableOpacity style={s.successPrimaryBtn} onPress={onClose} activeOpacity={0.82}>
            <Text style={s.successPrimaryBtnText}>Về trang chủ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.successSecondaryBtn}
            onPress={() => {
              onClose();
              // TODO: navigate to order tracking
            }}
            activeOpacity={0.75}
          >
            <Ionicons name="receipt-outline" size={15} color={COLORS.primaryDark} />
            <Text style={s.successSecondaryBtnText}>Xem đơn hàng</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ─────────────────────────────────────────────
export default function CheckoutScreen() {
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('cod');
  const [note, setNote] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderId] = useState(() => Math.random().toString(36).slice(2, 8).toUpperCase());

  // ── Tính tổng ──
  const subtotal = ORDER_ITEMS.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const originalTotal = ORDER_ITEMS.reduce((sum, it) => sum + (it.originalPrice ?? it.price) * it.quantity, 0);
  const saved = originalTotal - subtotal;
  const shippingFee = subtotal >= 200_000 ? 0 : 30_000;
  const total = subtotal + shippingFee;
  const totalQty = ORDER_ITEMS.reduce((s, i) => s + i.quantity, 0);

  const handleConfirm = () => {
    Alert.alert(
      'Xác nhận đặt hàng',
      `Tổng thanh toán: ${fmt(total)}\nPhương thức: ${PAYMENT_OPTIONS.find(p => p.id === selectedPayment)?.label}`,
      [
        { text: 'Quay lại', style: 'cancel' },
        { 
          text: 'Đặt hàng', 
          onPress: () => router.replace({ pathname: '/order-success', params: { orderId, total: total.toString() } }) 
        },
      ]
    );
  };

  return (
    <View style={s.container}>
      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={8}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Thanh toán</Text>
        <View style={{ width: 38 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Step Indicator ── */}
          <StepBar current={2} />

          {/* ── Bảo mật ── */}
          <View style={s.securityBadge}>
            <Ionicons name="lock-closed" size={13} color={COLORS.primary} />
            <Text style={s.securityText}>Thanh toán được mã hóa SSL 256-bit</Text>
          </View>

          {/* ══ 1. ĐỊA CHỈ GIAO HÀNG ══ */}
          <View style={s.card}>
            <SectionHeader icon="location-outline" title="Địa chỉ giao hàng" />

            <View style={s.addressBlock}>
              <View style={s.addressNameRow}>
                <Ionicons name="person-circle-outline" size={18} color={COLORS.textSecondary} />
                <Text style={s.addressName}>{SAVED_ADDRESS.name}</Text>
                <View style={s.defaultBadge}>
                  <Text style={s.defaultBadgeText}>Mặc định</Text>
                </View>
              </View>
              <Text style={s.addressPhone}>{SAVED_ADDRESS.phone}</Text>
              <Text style={s.addressText}>
                {SAVED_ADDRESS.address}, {SAVED_ADDRESS.ward},{'\n'}
                {SAVED_ADDRESS.district}, {SAVED_ADDRESS.city}
              </Text>
            </View>

            <TouchableOpacity style={s.changeBtn} activeOpacity={0.75}>
              <Ionicons name="create-outline" size={14} color={COLORS.primaryDark} />
              <Text style={s.changeBtnText}>Thay đổi địa chỉ</Text>
            </TouchableOpacity>
          </View>

          {/* ══ 2. PHƯƠNG THỨC THANH TOÁN ══ */}
          <View style={s.card}>
            <SectionHeader icon="card-outline" title="Phương thức thanh toán" />

            {PAYMENT_OPTIONS.map((option) => {
              const isSelected = selectedPayment === option.id;
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[s.paymentRow, isSelected && s.paymentRowSelected]}
                  onPress={() => setSelectedPayment(option.id)}
                  activeOpacity={0.75}
                >
                  {/* Left: icon */}
                  <View style={[s.paymentIconWrap, { backgroundColor: option.color + '18' }]}>
                    <Ionicons name={option.icon as any} size={20} color={option.color} />
                  </View>

                  {/* Middle: text */}
                  <View style={s.paymentTextWrap}>
                    <Text style={[s.paymentLabel, isSelected && s.paymentLabelSelected]}>
                      {option.label}
                    </Text>
                    <Text style={s.paymentSub}>{option.sub}</Text>
                  </View>

                  {/* Right: radio */}
                  <View style={[s.radio, isSelected && s.radioSelected]}>
                    {isSelected && <View style={s.radioDot} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ══ 3. TÓM TẮT ĐƠN HÀNG ══ */}
          <View style={s.card}>
            <SectionHeader icon="bag-outline" title={`Đơn hàng (${totalQty} cuốn)`} />

            {ORDER_ITEMS.map((item) => (
              <View key={item.id} style={s.orderItemRow}>
                <Image source={item.image} style={s.orderItemImage} />
                <View style={s.orderItemBody}>
                  <Text style={s.orderItemTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={s.orderItemAuthor}>{item.author}</Text>
                  <View style={s.orderItemFooter}>
                    <Text style={s.orderItemPrice}>{fmt(item.price)}</Text>
                    <Text style={s.orderItemQty}>× {item.quantity}</Text>
                    <Text style={s.orderItemSubtotal}>{fmt(item.price * item.quantity)}</Text>
                  </View>
                </View>
              </View>
            ))}

            <View style={s.summaryDivider} />

            {/* Tiết kiệm */}
            {saved > 0 && (
              <View style={s.savedRow}>
                <Ionicons name="gift-outline" size={14} color={COLORS.success} />
                <Text style={s.savedText}>Bạn tiết kiệm được <Text style={s.savedAmount}>{fmt(saved)}</Text></Text>
              </View>
            )}

            <View style={s.summaryGrid}>
              <View style={s.summaryLine}>
                <Text style={s.summaryLabel}>Tạm tính</Text>
                <Text style={s.summaryValue}>{fmt(subtotal)}</Text>
              </View>
              <View style={s.summaryLine}>
                <Text style={s.summaryLabel}>Phí vận chuyển</Text>
                {shippingFee === 0
                  ? <Text style={[s.summaryValue, { color: COLORS.success }]}>Miễn phí</Text>
                  : <Text style={s.summaryValue}>{fmt(shippingFee)}</Text>
                }
              </View>
              <View style={s.summaryLine}>
                <Text style={s.summaryLabel}>Giảm giá</Text>
                <Text style={[s.summaryValue, { color: COLORS.success }]}>-{fmt(saved)}</Text>
              </View>
              <View style={s.totalLine}>
                <Text style={s.totalLabel}>Tổng cộng</Text>
                <Text style={s.totalValue}>{fmt(total)}</Text>
              </View>
            </View>
          </View>

          {/* ══ 4. GHI CHÚ ══ */}
          <View style={s.card}>
            <SectionHeader icon="create-outline" title="Ghi chú đơn hàng" />
            <TextInput
              style={s.noteInput}
              placeholder="VD: Giao giờ hành chính, gọi trước khi giao..."
              placeholderTextColor={COLORS.textHint}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* ══ 5. CHÍNH SÁCH ══ */}
          <View style={s.policyRow}>
            <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.textSecondary} />
            <Text style={s.policyText}>
              Đổi trả miễn phí trong 7 ngày • Giao hàng toàn quốc
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ── Thanh xác nhận (fixed bottom) ── */}
      <View style={s.bottomBar}>
        <View style={s.bottomTotal}>
          <Text style={s.bottomTotalLabel}>Tổng thanh toán</Text>
          <Text style={s.bottomTotalValue}>{fmt(total)}</Text>
        </View>
        <TouchableOpacity style={s.confirmBtn} onPress={handleConfirm} activeOpacity={0.82}>
          <Ionicons name="checkmark-circle-outline" size={18} color={COLORS.white} />
          <Text style={s.confirmBtnText}>Xác nhận đặt hàng</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING['5xl'] - SPACING.lg,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    ...SHADOW.sm,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },

  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: 120,
    gap: SPACING.md,
  },

  // ── Step Bar ──
  stepBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: 0,
  },
  stepItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.surfaceAlt,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDone: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  stepActive: { backgroundColor: COLORS.primaryDark, borderColor: COLORS.primaryDark },
  stepNum: { fontSize: FONT_SIZE.xs, fontWeight: FONT_WEIGHT.bold, color: COLORS.textSecondary },
  stepLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  stepLabelActive: { color: COLORS.primaryDark, fontWeight: FONT_WEIGHT.bold },
  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.xs,
  },
  stepLineDone: { backgroundColor: COLORS.primary },

  // ── Security badge ──
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs + 2,
    alignSelf: 'center',
  },
  securityText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primaryDark,
    fontWeight: FONT_WEIGHT.semibold,
  },

  // ── Card ──
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    gap: SPACING.md,
    ...SHADOW.sm,
  },

  // ── Section Header ──
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  sectionIconWrap: {
    width: 28,
    height: 28,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },

  // ── Address ──
  addressBlock: { gap: SPACING.xs + 2 },
  addressNameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  addressName: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: COLORS.text, flex: 1 },
  defaultBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  defaultBadgeText: { fontSize: FONT_SIZE.xs, color: COLORS.primary, fontWeight: FONT_WEIGHT.semibold },
  addressPhone: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginLeft: 26 },
  addressText: { fontSize: FONT_SIZE.sm, color: COLORS.text, lineHeight: 20, marginLeft: 26 },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    alignSelf: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 1,
    borderRadius: RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.primaryDark,
  },
  changeBtnText: { fontSize: FONT_SIZE.sm, color: COLORS.primaryDark, fontWeight: FONT_WEIGHT.semibold },

  // ── Payment ──
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: SPACING.md,
    gap: SPACING.md,
  },
  paymentRowSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  paymentIconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentTextWrap: { flex: 1 },
  paymentLabel: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold, color: COLORS.text },
  paymentLabelSelected: { color: COLORS.primaryDark },
  paymentSub: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, marginTop: 2 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: COLORS.primary },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },

  // ── Order Items ──
  orderItemRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  orderItemImage: {
    width: 60,
    height: 80,
    borderRadius: RADIUS.sm,
    resizeMode: 'cover',
  },
  orderItemBody: { flex: 1, justifyContent: 'space-between' },
  orderItemTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    lineHeight: 20,
  },
  orderItemAuthor: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  orderItemFooter: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.xs },
  orderItemPrice: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: COLORS.primaryDark },
  orderItemQty: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  orderItemSubtotal: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },

  // ── Summary ──
  summaryDivider: { height: 1, backgroundColor: COLORS.divider, marginVertical: SPACING.sm },
  savedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    backgroundColor: '#EDF7ED',
    borderRadius: RADIUS.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
  },
  savedText: { fontSize: FONT_SIZE.sm, color: COLORS.text },
  savedAmount: { fontWeight: FONT_WEIGHT.bold, color: COLORS.success },
  summaryGrid: { gap: SPACING.sm },
  summaryLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  summaryValue: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: COLORS.text },
  totalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1.5,
    borderTopColor: COLORS.border,
    marginTop: SPACING.xs,
  },
  totalLabel: { fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  totalValue: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.extrabold, color: COLORS.primaryDark },

  // ── Note ──
  noteInput: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    minHeight: 80,
    lineHeight: 20,
  },

  // ── Policy ──
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.sm,
  },
  policyText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },

  // ── Bottom Bar ──
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING['2xl'],
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    gap: SPACING.lg,
    ...SHADOW.lg,
  },
  bottomTotal: { flex: 1 },
  bottomTotalLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  bottomTotalValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.primaryDark,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.md,
    shadowColor: COLORS.primaryDark,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 12,
    elevation: 5,
  },
  confirmBtnText: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },

  // ── Success Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING['2xl'],
    width: '100%',
    alignItems: 'center',
    gap: SPACING.lg,
    ...SHADOW.lg,
  },
  successIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  successTitle: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.text,
    textAlign: 'center',
  },
  successSub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  successInfo: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  successRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  successInfoLabel: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  successInfoValue: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  successDivider: { height: 1, backgroundColor: COLORS.divider },
  successPrimaryBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    shadowColor: COLORS.primaryDark,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  successPrimaryBtnText: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
  successSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    paddingVertical: SPACING.xs,
  },
  successSecondaryBtnText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primaryDark,
  },
});
