// CART SCREEN
// ─────────────────────────────────────────────
// Tâm lý học áp dụng:
// • Endowment Effect      — ảnh sách + tên rõ ràng → người dùng cảm thấy "đây là của tôi"
// • Loss Aversion         — tổng tiền hiển thị liên tục → thúc đẩy hoàn tất đơn
// • Sunk Cost Fallacy     — badge "Đã thêm" → khó xóa vì cảm giác đã đầu tư
// • Scarcity (FOMO)       — thanh tiến trình "Còn X để miễn phí ship"
// • Anchoring             — giá gốc gạch ngang bên cạnh giá sale
// • Fitts's Law           — nút +/- đủ lớn (36px), nút checkout full-width
// ─────────────────────────────────────────────

import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOW, SPACING } from '@/constants/colors';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── Types ───────────────────────────────────────────────────
type CartItem = {
  id: string;
  title: string;
  author: string;
  price: number;          // giá hiện tại (VNĐ)
  originalPrice?: number; // giá gốc để gạch (Anchoring Effect)
  image: any;
  quantity: number;
};

// ─── Dữ liệu mock ────────────────────────────────────────────
const INITIAL_ITEMS: CartItem[] = [
  {
    id: '1',
    title: 'Đắc Nhân Tâm',
    author: 'Dale Carnegie',
    price: 89_000,
    originalPrice: 112_000,
    image: require('../../assets/images/book1.jpg'),
    quantity: 1,
  },
  {
    id: '2',
    title: 'Nhà Giả Kim',
    author: 'Paulo Coelho',
    price: 55_000,
    originalPrice: 74_000,
    image: require('../../assets/images/book2.jpg'),
    quantity: 2,
  },
  {
    id: '3',
    title: 'Tôi thấy hoa vàng trên cỏ xanh',
    author: 'Nguyễn Nhật Ánh',
    price: 65_000,
    image: require('../../assets/images/book3.jpg'),
    quantity: 1,
  },
];

const FREE_SHIP_THRESHOLD = 200_000; // Scarcity: ngưỡng miễn phí ship

// ─── Helpers ─────────────────────────────────────────────────
const fmt = (n: number) =>
  n.toLocaleString('vi-VN') + 'đ';

// ─── CartItemRow ─────────────────────────────────────────────
function CartItemRow({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  item: CartItem;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={styles.itemCard}>
      {/* Ảnh sách — Endowment Effect */}
      <Image source={item.image} style={styles.itemImage} />

      {/* Nút xóa — góc trên bên phải */}
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={onRemove}
        activeOpacity={0.75}
        hitSlop={8}
      >
        <Ionicons name="trash-outline" size={17} color={COLORS.error} />
      </TouchableOpacity>

      <View style={styles.itemBody}>
        {/* Tên & tác giả */}
        <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.itemAuthor}>{item.author}</Text>

        {/* Giá — Anchoring Effect */}
        <View style={styles.priceRow}>
          <Text style={styles.itemPrice}>{fmt(item.price)}</Text>
          {item.originalPrice && (
            <Text style={styles.itemOriginalPrice}>{fmt(item.originalPrice)}</Text>
          )}
        </View>

        {/* Quantity controls */}
        <View style={styles.qtyRow}>
          {/* Nút giảm */}
          <TouchableOpacity
            style={[styles.qtyBtn, item.quantity === 1 && styles.qtyBtnDisabled]}
            onPress={onDecrease}
            activeOpacity={0.75}
            disabled={item.quantity === 1}
          >
            <Ionicons
              name="remove"
              size={16}
              color={item.quantity === 1 ? COLORS.textHint : COLORS.primaryDark}
            />
          </TouchableOpacity>

          <Text style={styles.qtyNum}>{item.quantity}</Text>

          {/* Nút tăng */}
          <TouchableOpacity style={styles.qtyBtn} onPress={onIncrease} activeOpacity={0.75}>
            <Ionicons name="add" size={16} color={COLORS.primaryDark} />
          </TouchableOpacity>

          {/* Thành tiền */}
          <Text style={styles.itemSubtotal}>
            = {fmt(item.price * item.quantity)}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────
export default function CartScreen() {
  const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS);

  const increase = (id: string) =>
    setItems((prev) =>
      prev.map((it) => it.id === id ? { ...it, quantity: it.quantity + 1 } : it)
    );

  const decrease = (id: string) =>
    setItems((prev) =>
      prev.map((it) => it.id === id && it.quantity > 1 ? { ...it, quantity: it.quantity - 1 } : it)
    );

  const remove = (id: string) => {
    Alert.alert(
      'Xóa sách',
      'Bạn có chắc muốn xóa sách này khỏi giỏ hàng?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => setItems((prev) => prev.filter((it) => it.id !== id)),
        },
      ]
    );
  };

  // ── Tính tổng ──
  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const shippingFee = subtotal >= FREE_SHIP_THRESHOLD ? 0 : 30_000;
  const total = subtotal + shippingFee;
  const remainForFreeShip = Math.max(0, FREE_SHIP_THRESHOLD - subtotal);
  const freeShipProgress = Math.min(1, subtotal / FREE_SHIP_THRESHOLD);

  // ── Giỏ trống ──
  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color={COLORS.border} />
        <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
        <Text style={styles.emptySub}>Hãy thêm sách yêu thích vào giỏ nhé!</Text>
        <TouchableOpacity
          style={styles.shopBtn}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.82}
        >
          <Text style={styles.shopBtnText}>Khám phá sách</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Giỏ hàng</Text>
          <Text style={styles.headerBadge}>{items.length} sách</Text>
        </View>

        {/* ── Thanh tiến trình miễn phí ship (Scarcity / FOMO) ── */}
        <View style={styles.freeShipCard}>
          <Ionicons
            name={remainForFreeShip === 0 ? 'checkmark-circle' : 'car-outline'}
            size={20}
            color={remainForFreeShip === 0 ? COLORS.success : COLORS.primaryDark}
          />
          <View style={styles.freeShipBody}>
            {remainForFreeShip === 0 ? (
              <Text style={styles.freeShipText}>
                🎉 <Text style={{ fontWeight: FONT_WEIGHT.bold }}>Bạn được miễn phí vận chuyển!</Text>
              </Text>
            ) : (
              <Text style={styles.freeShipText}>
                Mua thêm{' '}
                <Text style={styles.freeShipHighlight}>{fmt(remainForFreeShip)}</Text>
                {' '}để được miễn phí vận chuyển
              </Text>
            )}
            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${freeShipProgress * 100}%` as any }]} />
            </View>
          </View>
        </View>

        {/* ── Danh sách sách ── */}
        {items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            onIncrease={() => increase(item.id)}
            onDecrease={() => decrease(item.id)}
            onRemove={() => remove(item.id)}
          />
        ))}

        {/* ── Mã giảm giá ── */}
        <TouchableOpacity style={styles.couponRow} activeOpacity={0.75}>
          <Ionicons name="pricetag-outline" size={18} color={COLORS.primaryDark} />
          <Text style={styles.couponText}>Nhập mã giảm giá</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {/* ── Tóm tắt đơn hàng ── */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Chi tiết đơn hàng</Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính ({items.reduce((s, i) => s + i.quantity, 0)} cuốn)</Text>
            <Text style={styles.summaryValue}>{fmt(subtotal)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
            {shippingFee === 0 ? (
              <Text style={[styles.summaryValue, { color: COLORS.success }]}>Miễn phí</Text>
            ) : (
              <Text style={styles.summaryValue}>{fmt(shippingFee)}</Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Tổng cộng</Text>
            {/* Loss Aversion: tổng tiền lớn, màu đậm → người dùng muốn hoàn tất */}
            <Text style={styles.totalValue}>{fmt(total)}</Text>
          </View>
        </View>
      </ScrollView>

      {/* ── Nút đặt hàng (fixed bottom) — Fitts's Law ── */}
      <View style={styles.checkoutWrap}>
        <View style={styles.checkoutTotal}>
          <Text style={styles.checkoutTotalLabel}>Tổng</Text>
          <Text style={styles.checkoutTotalValue}>{fmt(total)}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          activeOpacity={0.82}
          onPress={() => console.log('Đặt hàng')}
        >
          <Text style={styles.checkoutBtnText}>Đặt hàng</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING['5xl'] - SPACING.md,
    paddingBottom: 110, // nhường chỗ cho nút checkout fixed
  },

  // ── Header ──
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.text,
  },
  headerBadge: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },

  // ── Free ship progress (Scarcity) ──
  freeShipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.primaryLight,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  freeShipBody: { flex: 1 },
  freeShipText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  freeShipHighlight: {
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.primaryDark,
  },
  progressTrack: {
    height: 6,
    backgroundColor: COLORS.border,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
  },

  // ── Cart item card ──
  itemCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.md,
    ...SHADOW.sm,
  },
  removeBtn: {
    position: 'absolute',
    bottom: SPACING.md,
    right: SPACING.md,
    width: 30,
    height: 30,
    borderRadius: RADIUS.sm,
    backgroundColor: '#FFEBEE',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  itemImage: {
    width: 80,
    height: 110,
    borderRadius: RADIUS.sm,
    resizeMode: 'cover',
  },
  itemBody: { flex: 1, justifyContent: 'space-between' },
  itemTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    lineHeight: 20,
  },
  itemAuthor: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginTop: SPACING.sm },
  itemPrice: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.primaryDark,
  },
  itemOriginalPrice: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    textDecorationLine: 'line-through',
  },

  // ── Quantity row ──
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.sm,
    gap: SPACING.sm,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnDisabled: { backgroundColor: COLORS.surfaceAlt },
  qtyNum: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    minWidth: 20,
    textAlign: 'center',
  },
  itemSubtotal: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },

  // ── Coupon ──
  couponRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    gap: SPACING.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.primaryDark,
  },
  couponText: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.primaryDark,
  },

  // ── Summary ──
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    ...SHADOW.sm,
  },
  summaryTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  summaryLabel: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  summaryValue: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.divider, marginVertical: SPACING.md },
  totalLabel: { fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  totalValue: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.primaryDark,
  },

  // ── Checkout bar (fixed bottom) ──
  checkoutWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    paddingBottom: SPACING['2xl'],
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    gap: SPACING.lg,
    ...SHADOW.lg,
  },
  checkoutTotal: { flex: 1 },
  checkoutTotalLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  checkoutTotalValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.primaryDark,
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING['2xl'],
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.md,
    gap: SPACING.sm,
    shadowColor: COLORS.primaryDark,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  checkoutBtnText: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },

  // ── Empty state ──
  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING['3xl'],
    gap: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    marginTop: SPACING.md,
  },
  emptySub: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
  },
  shopBtn: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING['3xl'],
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    shadowColor: COLORS.primaryDark,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  shopBtnText: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.white,
  },
});