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
import { api } from '../../services/api';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Alert } from 'react-native';

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
  CONFIRMED: { color: '#2E7D32', label: 'Đã xác nhận', icon: 'checkmark-done-circle', desc: 'Đơn hàng đã được xác nhận và chờ chuẩn bị.' },
  PACKING: { color: '#0277BD', label: 'Đang chuẩn bị hàng', icon: 'cube', desc: 'Người bán đang đóng gói đơn hàng của bạn.' },
  DELIVERING: { color: '#1A56DB', label: 'Đang giao hàng', icon: 'bicycle', desc: 'Đơn hàng đang trên đường giao đến bạn.' },
  DELIVERED: { color: COLORS.primaryDark, label: 'Giao hàng thành công', icon: 'checkmark-circle', desc: 'Đơn hàng đã được giao thành công.' },
  CANCELLED: { color: '#E53935', label: 'Đã hủy', icon: 'close-circle', desc: 'Đơn hàng đã bị hủy.' },
};

const fmt = (n: any) => Number(n || 0).toLocaleString('vi-VN') + 'đ';

// ─── Component ──────────────────────────────────────────────────
export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      if (res.data?.success) {
        setOrder(res.data.data);
      }
    } catch (error) {
      console.log('Error fetching order', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRepay = async () => {
    if (!order) return;
    try {
      const redirectUrl = Linking.createURL('payment-result');
      const returnUrl = `${api.defaults.baseURL}/payments/vnpay/vnpay_return`;
      const vnpRes = await api.post('/payments/vnpay/create_url', {
        order_id: order.order_code,
        amount: order.total_amount,
        order_info: `Thanh toan don hang ${order.order_code}`,
        return_url: returnUrl
      }, {
        params: { app_redirect: redirectUrl }
      });

      if (vnpRes.data?.success && vnpRes.data?.data?.payment_url) {
        const result = await WebBrowser.openAuthSessionAsync(
          vnpRes.data.data.payment_url,
          redirectUrl
        );
        if (result.type === 'success') {
          fetchOrder(); // Cập nhật lại trạng thái thành công
        } else if (result.type === 'cancel' || result.type === 'dismiss') {
          fetchOrder(); // Cập nhật lại trạng thái thất bại
        }
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Lỗi', 'Không thể tạo link thanh toán.');
    }
  };

  if (loading || !order) return <SafeAreaView style={styles.container} />;

  // Map status
  let mappedStatus = 'PENDING';
  const os = order.order_status?.toLowerCase() || '';
  if (os === 'pending') mappedStatus = 'PENDING';
  else if (os === 'confirmed') mappedStatus = 'CONFIRMED';
  else if (os === 'packing') mappedStatus = 'PACKING';
  else if (os === 'shipping') mappedStatus = 'DELIVERING';
  else if (os === 'delivered') mappedStatus = 'DELIVERED';
  else if (os === 'cancelled' || os === 'returned') mappedStatus = 'CANCELLED';
  
  const statusConfig = STATUS_CONFIG[mappedStatus] || STATUS_CONFIG.PENDING;

  // Xử lý địa chỉ
  let parsedAddress = { name: '', phone: '', address: '' };
  try {
    const p = typeof order.shipping_snapshot === 'string' ? JSON.parse(order.shipping_snapshot) : (order.shipping_snapshot || {});
    const pAddress = p.full_address || [p.street_address, p.ward, p.district, p.city].filter(Boolean).join(', ') || p.address || '';
    parsedAddress = {
      name: p.full_name || p.recipient_name || order.customer_name || '',
      phone: p.phone || order.customer_phone || '',
      address: pAddress
    };
  } catch (e) {}

  const canRepay = mappedStatus !== 'CANCELLED' && order.payment_method === 'vnpay' && (order.payment_status === 'pending' || order.payment_status === 'failed');

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
            <Text style={styles.addressName}>{parsedAddress.name}</Text>
            <Text style={styles.addressPhone}>{parsedAddress.phone}</Text>
            <Text style={styles.addressText}>{parsedAddress.address}</Text>
          </View>
        </View>

        {/* ── Order Items ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="bag-outline" size={18} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Sản phẩm đã mua</Text>
          </View>
          
          {order.items?.map((item: any, index: number) => (
            <View key={item.id}>
              <View style={styles.itemRow}>
                <Image source={{ uri: item.image_url }} style={styles.itemImage} contentFit="cover" />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={2}>{item.item_name}</Text>
                  {item.isCombo && (
                    <View style={styles.comboBadge}>
                      <Text style={styles.comboBadgeText}>COMBO</Text>
                    </View>
                  )}
                  <View style={styles.itemPriceRow}>
                    <Text style={styles.itemPrice}>{fmt(item.unit_price)}</Text>
                    <Text style={styles.itemQty}>x{item.quantity}</Text>
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
            <Text style={styles.infoValue}>#{order.order_code}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Thời gian đặt</Text>
            <Text style={styles.infoValue}>{new Date(order.created_at).toLocaleString('vi-VN')}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phương thức thanh toán</Text>
            <Text style={styles.infoValue}>{order.payment_method === 'vnpay' ? 'VNPAY' : 'Thanh toán khi nhận hàng'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Trạng thái thanh toán</Text>
            <Text style={[styles.infoValue, { color: order.payment_status === 'paid' ? COLORS.success : COLORS.error }]}>
              {order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
            </Text>
          </View>

          <View style={styles.dashedDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Tạm tính</Text>
            <Text style={styles.summaryValue}>{fmt(order.subtotal || 0)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Phí vận chuyển</Text>
            <Text style={styles.summaryValue}>{fmt(order.shipping_fee || 0)}</Text>
          </View>
          {Number(order.discount_amount) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Voucher giảm giá</Text>
              <Text style={[styles.summaryValue, { color: COLORS.success }]}>-{fmt(order.discount_amount)}</Text>
            </View>
          )}
          {Number(order.points_discount) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Dùng điểm thưởng</Text>
              <Text style={[styles.summaryValue, { color: COLORS.success }]}>-{fmt(order.points_discount)}</Text>
            </View>
          )}
          
          <View style={styles.divider} />
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalValue}>{fmt(order.total_amount)}</Text>
          </View>
        </View>

      </ScrollView>

      {/* ── Footer Actions ── */}
      <View style={styles.footer}>
        {canRepay && (
          <TouchableOpacity style={[styles.primaryBtn, { marginBottom: SPACING.sm }]} onPress={handleRepay}>
            <Text style={styles.primaryBtnText}>Thanh toán lại qua VNPAY</Text>
          </TouchableOpacity>
        )}
        {mappedStatus === 'PENDING' && !canRepay && (
          <TouchableOpacity style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Hủy đơn hàng</Text>
          </TouchableOpacity>
        )}
        {mappedStatus === 'DELIVERED' && (
          <TouchableOpacity style={styles.reviewBtn} onPress={() => router.push(`/order-review?orderId=${order.id}`)}>
            <Ionicons name="star" size={18} color="#fff" style={{ marginRight: 6 }} />
            <Text style={styles.reviewBtnText}>Đánh giá nhận điểm</Text>
          </TouchableOpacity>
        )}
        {(mappedStatus === 'CANCELLED' || mappedStatus === 'DELIVERED') && (
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
  comboBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  comboBadgeText: {
    color: '#2E7D32',
    fontSize: 10,
    fontWeight: 'bold',
  },
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
  reviewBtn: {
    backgroundColor: '#FF9800',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOW.sm,
  },
  reviewBtnText: { color: COLORS.white, fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold },
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

