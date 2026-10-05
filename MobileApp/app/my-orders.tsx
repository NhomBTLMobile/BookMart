import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  Platform,
  Modal,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOW, SPACING } from '../constants/colors';
import { orderService } from '../services/orderService';
import { useCart } from '../context/CartContext';
import { api } from '../services/api';

// ─── Types ────────────────────────────────────────────────────────
type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PACKING' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED';

type OrderItem = {
  id?: string;
  book_id?: string;
  combo_id?: string;
  title: string;
  image: any;
  price: number;
  qty: number;
  isCombo?: boolean;
};

type Order = {
  id: string;
  internalId: string;
  rawStatus: string;
  status: OrderStatus;
  date: string;
  total: number;
  paymentMethod: string;
  items: OrderItem[];
};

// ─── Constants ───────────────────────────────────────────────────
const TABS: { id: OrderStatus; label: string; icon: string }[] = [
  { id: 'PENDING',   label: 'Chờ duyệt',  icon: 'time-outline' },
  { id: 'CONFIRMED', label: 'Đã duyệt',   icon: 'checkmark-outline' },
  { id: 'PACKING',   label: 'Đóng gói',   icon: 'cube-outline' },
  { id: 'SHIPPING',  label: 'Đang giao',  icon: 'bicycle-outline' },
  { id: 'DELIVERED', label: 'Đã giao',    icon: 'checkmark-circle-outline' },
  { id: 'CANCELLED', label: 'Đã hủy',     icon: 'close-circle-outline' },
];

const STATUS_CONFIG: Record<OrderStatus, { color: string; bg: string; label: string; icon: string }> = {
  PENDING:   { color: '#E5A72A', bg: '#FFF8E1', label: 'Chờ xác nhận',         icon: 'time-outline' },
  CONFIRMED: { color: '#1565C0', bg: '#E3F2FD', label: 'Đã xác nhận',          icon: 'checkmark-circle-outline' },
  PACKING:   { color: '#6A1B9A', bg: '#F3E5F5', label: 'Đang đóng gói',        icon: 'cube-outline' },
  SHIPPING:  { color: '#0277BD', bg: '#E1F5FE', label: 'Đang giao hàng',       icon: 'bicycle-outline' },
  DELIVERED: { color: '#2E7D32', bg: '#E8F5E9', label: 'Giao thành công',      icon: 'checkmark-circle' },
  CANCELLED: { color: '#C62828', bg: '#FFEBEE', label: 'Đã hủy',               icon: 'close-circle-outline' },
};

const fmt = (n: any) => Number(n || 0).toLocaleString('vi-VN') + 'đ';

const DB_STATUS_MAP: Record<string, OrderStatus> = {
  pending:   'PENDING',
  confirmed: 'CONFIRMED',
  packing:   'PACKING',
  shipping:  'SHIPPING',
  delivered: 'DELIVERED',
  cancelled: 'CANCELLED',
};

// ─── Review Modal ─────────────────────────────────────────────────
function ReviewModal({
  visible,
  order,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  order: Order | null;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert('Lưu ý', 'Vui lòng nhập nội dung đánh giá');
      return;
    }
    setSubmitting(true);
    await onSubmit(rating, comment);
    setSubmitting(false);
    setRating(5);
    setComment('');
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={rv.overlay}>
        <View style={rv.sheet}>
          <View style={rv.sheetHeader}>
            <Text style={rv.sheetTitle}>Đánh giá đơn hàng</Text>
            <TouchableOpacity onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>

          {order && order.items.length > 0 && (
            <View style={rv.productPreview}>
              <Image source={order.items[0].image} style={rv.previewImg} contentFit="cover" />
              <Text style={rv.previewTitle} numberOfLines={2}>{order.items[0].title}</Text>
            </View>
          )}

          {/* Star Rating */}
          <Text style={rv.label}>Chất lượng sản phẩm</Text>
          <View style={rv.stars}>
            {[1, 2, 3, 4, 5].map(s => (
              <TouchableOpacity key={s} onPress={() => setRating(s)} hitSlop={6}>
                <Ionicons
                  name={s <= rating ? 'star' : 'star-outline'}
                  size={34}
                  color={s <= rating ? '#FFB300' : COLORS.border}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={rv.ratingLabel}>
            {['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời!'][rating]}
          </Text>

          {/* Comment */}
          <Text style={rv.label}>Nhận xét của bạn</Text>
          <TextInput
            style={rv.input}
            placeholder="Chia sẻ cảm nhận về sản phẩm..."
            placeholderTextColor={COLORS.textHint}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <View style={rv.pointsNote}>
            <Ionicons name="gift-outline" size={16} color={COLORS.primary} />
            <Text style={rv.pointsText}>Viết đánh giá để nhận <Text style={{ fontWeight: 'bold', color: COLORS.primaryDark }}>+{rating * 10} điểm</Text> thưởng!</Text>
          </View>

          <TouchableOpacity
            style={[rv.submitBtn, submitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.82}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="send-outline" size={16} color="#fff" />
                <Text style={rv.submitBtnText}>Gửi đánh giá</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────
export default function MyOrdersScreen() {
  const [activeTab, setActiveTab] = useState<OrderStatus>('PENDING');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const { addToCart } = useCart();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await orderService.getMyOrders();
      if (res.success && res.data) {
        const mappedOrders: Order[] = res.data.map((o: any) => {
          const rawStatus = o.order_status || 'pending';
          const status: OrderStatus = DB_STATUS_MAP[rawStatus] || 'PENDING';
          const d = new Date(o.created_at);
          return {
            id: o.order_code || o.id,
            internalId: o.id,
            rawStatus,
            status,
            date: `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`,
            total: parseFloat(o.total_amount),
            paymentMethod: o.payment_method || 'cod',
            items: (o.items || []).map((i: any) => ({
              id: i.id,
              book_id: i.book_id,
              combo_id: i.combo_id,
              title: i.item_name,
              image: i.image_url ? { uri: i.image_url } : require('../assets/images/book1.jpg'),
              price: parseFloat(i.unit_price),
              qty: i.quantity,
              isCombo: !!i.combo_id,
            })),
          };
        });
        setOrders(mappedOrders);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload every time screen gets focus
  useFocusEffect(useCallback(() => { fetchOrders(); }, [fetchOrders]));

  // ── Hủy đơn ──
  const handleCancel = (order: Order) => {
    Alert.alert('Hủy đơn hàng', 'Bạn có chắc muốn hủy đơn này không?', [
      { text: 'Không', style: 'cancel' },
      {
        text: 'Hủy đơn', style: 'destructive',
        onPress: async () => {
          try {
            await api.put(`/orders/${order.internalId}`, { order_status: 'cancelled' });
            fetchOrders();
          } catch {
            Alert.alert('Lỗi', 'Không thể hủy đơn lúc này');
          }
        },
      },
    ]);
  };

  // ── Mua lại ──
  const handleBuyAgain = (order: Order) => {
    order.items.forEach(item => {
      addToCart({
        id: item.book_id || item.combo_id || item.id || '',
        title: item.title,
        price: item.price,
        image: item.image,
        quantity: item.qty,
        isCombo: item.isCombo,
      });
    });
    Alert.alert('Đã thêm vào giỏ!', 'Các sản phẩm đã được thêm vào giỏ hàng.', [
      { text: 'Xem giỏ hàng', onPress: () => router.push('/(tabs)/cart') },
      { text: 'Tiếp tục mua', style: 'cancel' },
    ]);
  };

  // ── Gửi đánh giá ──
  const handleSubmitReview = async (rating: number, comment: string) => {
    if (!reviewOrder) return;
    try {
      // Submit review for each book item
      const bookItems = reviewOrder.items.filter(i => !i.isCombo && i.book_id);
      for (const item of bookItems) {
        await api.post('/reviews', {
          book_id: item.book_id,
          rating,
          comment,
        });
      }
      Alert.alert('Cảm ơn bạn! 🎉', `Đánh giá đã được gửi. Bạn nhận được +${rating * 10} điểm thưởng!`);
      setReviewOrder(null);
    } catch (e: any) {
      Alert.alert('Lỗi', e.response?.data?.message || 'Không thể gửi đánh giá');
    }
  };

  const filteredOrders = orders.filter(o => o.status === activeTab);

  // ─── Order Card ───────────────────────────────────────────────
  const renderOrder = ({ item }: { item: Order }) => {
    const config = STATUS_CONFIG[item.status];
    const firstItem = item.items[0];
    const moreCount = item.items.length - 1;

    return (
      <TouchableOpacity
        style={s.card}
        activeOpacity={0.85}
        onPress={() => router.push(`/order/${item.id}` as any)}
      >
        {/* ── Status Strip ── */}
        <View style={[s.statusStrip, { backgroundColor: config.bg }]}>
          <Ionicons name={config.icon as any} size={14} color={config.color} />
          <Text style={[s.statusLabel, { color: config.color }]}>{config.label}</Text>
          <Text style={s.orderId}>#{item.id}</Text>
        </View>

        {/* ── Product Preview ── */}
        {firstItem && (
          <View style={s.productRow}>
            <Image source={firstItem.image} style={s.productImg} contentFit="cover" />
            <View style={s.productInfo}>
              <Text style={s.productTitle} numberOfLines={2}>{firstItem.title}</Text>
              {firstItem.isCombo && (
                <View style={s.comboBadge}>
                  <Text style={s.comboBadgeText}>COMBO</Text>
                </View>
              )}
              <Text style={s.productMeta}>{fmt(firstItem.price)} × {firstItem.qty}</Text>
            </View>
          </View>
        )}
        {moreCount > 0 && (
          <Text style={s.moreText}>+{moreCount} sản phẩm khác</Text>
        )}

        <View style={s.divider} />

        {/* ── Footer ── */}
        <View style={s.footer}>
          <View>
            <Text style={s.dateText}>{item.date}</Text>
            <Text style={s.totalText}>
              Tổng: <Text style={s.totalAmount}>{fmt(item.total)}</Text>
            </Text>
          </View>

          <View style={s.actions}>
            {/* Hủy đơn — chỉ khi đang chờ */}
            {item.status === 'PENDING' && (
              <TouchableOpacity
                style={s.btnOutline}
                onPress={() => handleCancel(item)}
                activeOpacity={0.7}
              >
                <Text style={s.btnOutlineText}>Hủy đơn</Text>
              </TouchableOpacity>
            )}

            {/* Đánh giá — chỉ sau khi giao thành công */}
            {item.status === 'DELIVERED' && (
              <TouchableOpacity
                style={s.btnPrimary}
                onPress={() => setReviewOrder(item)}
                activeOpacity={0.82}
              >
                <Ionicons name="star-outline" size={13} color="#fff" />
                <Text style={s.btnPrimaryText}>Đánh giá</Text>
              </TouchableOpacity>
            )}

            {/* Mua lại — sau khi giao hoặc đã hủy */}
            {(item.status === 'DELIVERED' || item.status === 'CANCELLED') && (
              <TouchableOpacity
                style={s.btnOutline}
                onPress={() => handleBuyAgain(item)}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh-outline" size={13} color={COLORS.textSecondary} />
                <Text style={s.btnOutlineText}>Mua lại</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={s.container}>
      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Đơn hàng của tôi</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Tab Bar (scrollable) ── */}
      <View style={s.tabWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
          {TABS.map(tab => {
            const isActive = activeTab === tab.id;
            const cfg = STATUS_CONFIG[tab.id];
            const count = orders.filter(o => o.status === tab.id).length;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[s.tabBtn, isActive && { borderBottomColor: cfg.color }]}
                onPress={() => setActiveTab(tab.id)}
                activeOpacity={0.75}
              >
                <Ionicons name={tab.icon as any} size={14} color={isActive ? cfg.color : COLORS.textSecondary} />
                <Text style={[s.tabText, isActive && { color: cfg.color, fontWeight: FONT_WEIGHT.bold }]}>
                  {tab.label}
                </Text>
                {count > 0 && (
                  <View style={[s.tabBadge, { backgroundColor: cfg.color }]}>
                    <Text style={s.tabBadgeText}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── List ── */}
      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={item => item.id}
          renderItem={renderOrder}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={s.emptyState}>
              <Ionicons name="receipt-outline" size={72} color={COLORS.divider} />
              <Text style={s.emptyTitle}>Chưa có đơn hàng</Text>
              <Text style={s.emptySub}>Đơn hàng của bạn sẽ xuất hiện ở đây</Text>
              <TouchableOpacity style={s.shopBtn} onPress={() => router.replace('/(tabs)')}>
                <Text style={s.shopBtnText}>Khám phá ngay</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* ── Review Modal ── */}
      <ReviewModal
        visible={reviewOrder !== null}
        order={reviewOrder}
        onClose={() => setReviewOrder(null)}
        onSubmit={handleSubmitReview}
      />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F4F0' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'ios' ? 0 : SPACING.lg,
    paddingBottom: SPACING.md,
    ...SHADOW.sm,
  },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },

  tabWrap: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  tabScroll: { paddingHorizontal: SPACING.sm },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    borderBottomWidth: 2.5,
    borderBottomColor: 'transparent',
  },
  tabText: { fontSize: 12.5, color: COLORS.textSecondary, fontWeight: FONT_WEIGHT.medium },
  tabBadge: {
    minWidth: 18, height: 18,
    borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  listContent: { padding: SPACING.md, paddingBottom: 80 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  statusStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
  },
  statusLabel: { fontSize: 13, fontWeight: FONT_WEIGHT.semibold, flex: 1 },
  orderId: { fontSize: 11, color: COLORS.textSecondary, fontWeight: FONT_WEIGHT.medium },

  productRow: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, paddingTop: SPACING.sm },
  productImg: { width: 60, height: 80, borderRadius: RADIUS.sm, backgroundColor: COLORS.background },
  productInfo: { flex: 1, marginLeft: SPACING.md },
  productTitle: { fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: COLORS.text, lineHeight: 20, marginBottom: 4 },
  productMeta: { fontSize: 13, color: COLORS.textSecondary, marginTop: 4 },
  comboBadge: { alignSelf: 'flex-start', backgroundColor: '#E8F5E9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 2 },
  comboBadgeText: { color: '#2E7D32', fontSize: 10, fontWeight: 'bold' },

  moreText: { fontSize: 12, color: COLORS.textSecondary, paddingHorizontal: SPACING.md, paddingBottom: SPACING.sm },
  divider: { height: 1, backgroundColor: COLORS.divider, marginHorizontal: SPACING.md },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    paddingTop: SPACING.sm,
  },
  dateText: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 2 },
  totalText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  totalAmount: { color: COLORS.primaryDark, fontWeight: FONT_WEIGHT.bold, fontSize: FONT_SIZE.base },

  actions: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: RADIUS.md,
  },
  btnPrimaryText: { color: '#fff', fontSize: 13, fontWeight: FONT_WEIGHT.bold },
  btnOutline: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderColor: COLORS.divider,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: RADIUS.md, backgroundColor: COLORS.white,
  },
  btnOutlineText: { color: COLORS.textSecondary, fontSize: 13, fontWeight: FONT_WEIGHT.medium },

  // Empty
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: SPACING.xl },
  emptyTitle: { marginTop: SPACING.md, fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  emptySub: { marginTop: SPACING.xs, fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, textAlign: 'center' },
  shopBtn: {
    marginTop: SPACING.xl,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28, paddingVertical: 12,
    borderRadius: RADIUS.full,
  },
  shopBtnText: { color: '#fff', fontWeight: FONT_WEIGHT.bold, fontSize: FONT_SIZE.base },
});

// ─── Review Modal Styles ──────────────────────────────────────────
const rv = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: SPACING.xl,
    paddingBottom: Platform.OS === 'ios' ? 40 : SPACING.xl,
  },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  sheetTitle: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },

  productPreview: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.lg, backgroundColor: COLORS.background, padding: SPACING.sm, borderRadius: RADIUS.md },
  previewImg: { width: 48, height: 64, borderRadius: RADIUS.sm },
  previewTitle: { flex: 1, fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: COLORS.text },

  label: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: COLORS.textSecondary, marginBottom: SPACING.sm },
  stars: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  ratingLabel: { fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold, color: '#FFB300', marginBottom: SPACING.md, minHeight: 22 },

  input: {
    borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    minHeight: 90, fontSize: FONT_SIZE.base,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },

  pointsNote: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF8E1', borderRadius: RADIUS.sm,
    padding: SPACING.sm, marginBottom: SPACING.lg,
  },
  pointsText: { fontSize: FONT_SIZE.sm, color: COLORS.text, flex: 1 },

  submitBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md, paddingVertical: 14,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
  },
  submitBtnText: { color: '#fff', fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold },
});
