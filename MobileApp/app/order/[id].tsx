import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  Platform 
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOW, SPACING } from '../../constants/colors';

// ─── Mock Data (Nên fetch từ API ở thực tế) ─────────────────────────
const MOCK_ORDER_DETAIL = {
  id: 'BMX9821A',
  status: 'PENDING', // 'PENDING' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED'
  date: '29/09/2026 10:24',
  paymentMethod: 'Tiền mặt (COD)',
  shippingAddress: {
    name: 'Nguyễn Văn An',
    phone: '0901 234 567',
    address: '123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'
  },
  items: [
    { id: '1', title: 'Đắc Nhân Tâm', author: 'Dale Carnegie', image: require('../../assets/images/book1.jpg'), price: 89000, originalPrice: 112000, qty: 1 },
    { id: '3', title: 'Tôi thấy hoa vàng trên cỏ xanh', author: 'Nguyễn Nhật Ánh', image: require('../../assets/images/book3.jpg'), price: 65000, originalPrice: 85000, qty: 1 },
  ],
  subtotal: 154000,
  shippingFee: 30000,
  discount: 30000,
  total: 154000,
};

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: string; desc: string }> = {
  PENDING: { color: '#E5A72A', label: 'Chờ xác nhận', icon: 'time', desc: 'Đơn hàng đang chờ người bán xác nhận.' },
  DELIVERING: { color: '#1A56DB', label: 'Đang giao hàng', icon: 'bicycle', desc: 'Đơn hàng đang trên đường giao đến bạn.' },
  DELIVERED: { color: COLORS.primaryDark, label: 'Giao hàng thành công', icon: 'checkmark-circle', desc: 'Đơn hàng đã được giao thành công.' },
  CANCELLED: { color: '#E53935', label: 'Đã hủy', icon: 'close-circle', desc: 'Đơn hàng đã bị hủy.' },
};

const fmt = (n: any) => Number(n || 0).toLocaleString('vi-VN') + 'đ';

// ─── Component ──────────────────────────────────────────────────
export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  // Dùng mock data hiện tại
  const order = { ...MOCK_ORDER_DETAIL, id: id || MOCK_ORDER_DETAIL.id };
  const statusConfig = STATUS_CONFIG[order.status];

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        
        {/* ── Status Banner ── */}
        <View style={[styles.statusBanner, { backgroundColor: statusConfig.color }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.statusLabel}>{statusConfig.label}</Text>
            <Text style={styles.statusDesc}>{statusConfig.desc}</Text>
          </View>
          <Ionicons name={statusConfig.icon as any} size={48} color="rgba(255,255,255,0.2)" style={styles.statusIcon} />
        </View>

        {/* ── Shipping Address ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location-outline" size={18} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Địa chỉ nhận hàng</Text>
          </View>
          <View style={styles.addressBox}>
            <Text style={styles.addressName}>{order.shippingAddress.name}</Text>
            <Text style={styles.addressPhone}>{order.shippingAddress.phone}</Text>
            <Text style={styles.addressText}>{order.shippingAddress.address}</Text>
          </View>
        </View>

        {/* ── Order Items ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="bag-outline" size={18} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Sản phẩm đã mua</Text>
          </View>
          
          {order.items.map((item, index) => (
            <View key={item.id}>
              <View style={styles.itemRow}>
                <Image source={item.image} style={styles.itemImage} contentFit="cover" />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.itemAuthor}>{item.author}</Text>
                  <View style={styles.itemPriceRow}>
                    <Text style={styles.itemPrice}>{fmt(item.price)}</Text>
                    <Text style={styles.itemQty}>x{item.qty}</Text>
                  </View>
                </View>
              </View>
              {index < order.items.length - 1 && <View style={styles.divider} />}
            </View>
          ))}
        </View>

        {/* ── Order Info & Summary ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="receipt-outline" size={18} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Thông tin thanh toán</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mã đơn hàng</Text>
            <Text style={styles.infoValue}>#{order.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Thời gian đặt</Text>
            <Text style={styles.infoValue}>{order.date}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phương thức</Text>
            <Text style={styles.infoValue}>{order.paymentMethod}</Text>
          </View>

          <View style={styles.dashedDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>{fmt(order.subtotal)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
            <Text style={styles.summaryValue}>{fmt(order.shippingFee)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Giảm giá</Text>
            <Text style={[styles.summaryValue, { color: COLORS.success }]}>-{fmt(order.discount)}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalValue}>{fmt(order.total)}</Text>
          </View>
        </View>

      </ScrollView>

      {/* ── Footer Actions ── */}
      <View style={styles.footer}>
        {order.status === 'PENDING' && (
          <TouchableOpacity style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Hủy đơn hàng</Text>
          </TouchableOpacity>
        )}
        {order.status === 'DELIVERED' && (
          <TouchableOpacity style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Đánh giá sản phẩm</Text>
          </TouchableOpacity>
        )}
        {(order.status === 'CANCELLED' || order.status === 'DELIVERED') && (
          <TouchableOpacity style={styles.primaryBtn}>
            <Text style={styles.primaryBtnText}>Mua lại</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'ios' ? SPACING.sm : SPACING.xl,
    paddingBottom: SPACING.md,
    ...SHADOW.sm,
    zIndex: 10,
  },
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  
  content: {
    paddingBottom: SPACING['3xl'],
  },

  // Banner
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.xl,
    paddingTop: SPACING['2xl'],
    paddingBottom: SPACING['2xl'],
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  statusLabel: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.bold, color: COLORS.white, marginBottom: 4 },
  statusDesc: { fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.9)', lineHeight: 20 },
  statusIcon: { position: 'absolute', right: SPACING.xl, top: SPACING.xl },

  // Cards
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOW.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  cardTitle: { fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },

  // Address
  addressBox: { paddingLeft: SPACING.md + SPACING.xs },
  addressName: { fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  addressPhone: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 2, marginBottom: 6 },
  addressText: { fontSize: FONT_SIZE.sm, color: COLORS.text, lineHeight: 20 },

  // Items
  itemRow: { flexDirection: 'row', paddingVertical: SPACING.xs },
  itemImage: { width: 64, height: 85, borderRadius: RADIUS.sm, backgroundColor: COLORS.background },
  itemInfo: { flex: 1, marginLeft: SPACING.md },
  itemTitle: { fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.semibold, color: COLORS.text, marginBottom: 2 },
  itemAuthor: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 8 },
  itemPriceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemPrice: { fontSize: FONT_SIZE.sm, color: COLORS.primaryDark, fontWeight: FONT_WEIGHT.bold },
  itemQty: { fontSize: FONT_SIZE.sm, color: COLORS.text, fontWeight: FONT_WEIGHT.medium },

  // Info & Summary
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  infoLabel: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  infoValue: { fontSize: FONT_SIZE.sm, color: COLORS.text, fontWeight: FONT_WEIGHT.medium },
  
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  summaryValue: { fontSize: FONT_SIZE.sm, color: COLORS.text, fontWeight: FONT_WEIGHT.medium },
  
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: SPACING.sm },
  totalLabel: { fontSize: FONT_SIZE.base, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  totalValue: { fontSize: FONT_SIZE.xl, fontWeight: FONT_WEIGHT.extrabold, color: COLORS.primaryDark },

  // Dividers
  divider: { height: 1, backgroundColor: COLORS.divider, marginVertical: SPACING.md },
  dashedDivider: { 
    height: 1, 
    borderStyle: 'dashed', 
    borderWidth: 1, 
    borderColor: COLORS.divider, 
    marginVertical: SPACING.md 
  },

  // Footer Actions
  footer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 32 : SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  primaryBtnText: { color: COLORS.white, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold },
  cancelBtn: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  cancelBtnText: { color: COLORS.text, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.semibold },
});

