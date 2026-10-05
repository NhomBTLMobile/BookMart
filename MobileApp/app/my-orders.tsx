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

// ReviewModal removed. Utilizing order-review screen instead.

// ─── Main Screen ─────────────────────────────────────────────────
export default function MyOrdersScreen() {
  const [activeTab, setActiveTab] = useState<OrderStatus>('PENDING');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Gửi đánh giá removed, using separate screen

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
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name={config.icon as any} size={14} color={config.color} />
            <Text style={[s.statusLabel, { color: config.color }]}>{config.label}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.orderId}>#{item.id}</Text>
            <Text style={s.dateTextHeader}>{item.date}</Text>
          </View>
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
          <View style={s.totalRow}>
            <Text style={s.totalText}>Thành tiền:</Text>
            <Text style={s.totalAmount}>{fmt(item.total)}</Text>
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

            {/* Đánh giá — chỉ sau khi giao thành công */}
            {item.status === 'DELIVERED' && (
              <TouchableOpacity
                style={s.btnReview}
                onPress={() => router.push(`/order-review?orderId=${item.internalId}` as any)}
                activeOpacity={0.82}
              >
                <Ionicons name="star" size={13} color="#fff" />
                <Text style={s.btnReviewText}>Đánh giá nhận điểm</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
  },
  statusLabel: { fontSize: 13, fontWeight: FONT_WEIGHT.semibold },
  orderId: { fontSize: 12, color: COLORS.text, fontWeight: FONT_WEIGHT.bold },
  dateTextHeader: { fontSize: 10, color: COLORS.textSecondary, marginTop: 2 },

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
    padding: SPACING.md,
    paddingTop: SPACING.sm,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  totalText: { fontSize: FONT_SIZE.sm, color: COLORS.text },
  totalAmount: { color: COLORS.primaryDark, fontWeight: FONT_WEIGHT.bold, fontSize: FONT_SIZE.lg },

  actions: { flexDirection: 'row', gap: SPACING.sm, justifyContent: 'flex-end', alignItems: 'center' },
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
  btnReview: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#FF9800', // Khác biệt, thu hút sự chú ý
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: RADIUS.md,
    ...SHADOW.sm,
  },
  btnReviewText: { color: '#fff', fontSize: 13, fontWeight: FONT_WEIGHT.bold },

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


