import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList, 
  SafeAreaView, 
  Platform 
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOW, SPACING } from '../constants/colors';

// ─── Types ────────────────────────────────────────────────────────
type OrderStatus = 'PENDING' | 'DELIVERING' | 'DELIVERED' | 'CANCELLED';

type Order = {
  id: string;
  status: OrderStatus;
  date: string;
  total: number;
  items: {
    title: string;
    image: any;
    price: number;
    qty: number;
  }[];
};

// ─── Mock Data ───────────────────────────────────────────────────
const MOCK_ORDERS: Order[] = [
  {
    id: 'BMX9821A',
    status: 'PENDING',
    date: 'Hôm nay, 10:24',
    total: 154000,
    items: [
      { title: 'Đắc Nhân Tâm', image: require('../assets/images/book1.jpg'), price: 89000, qty: 1 },
      { title: 'Tôi thấy hoa vàng trên cỏ xanh', image: require('../assets/images/book3.jpg'), price: 65000, qty: 1 },
    ],
  },
  {
    id: 'BMT5521C',
    status: 'DELIVERING',
    date: '12/05/2026',
    total: 55000,
    items: [
      { title: 'Nhà Giả Kim', image: require('../assets/images/book2.jpg'), price: 55000, qty: 1 },
    ],
  },
  {
    id: 'BMK1190D',
    status: 'DELIVERED',
    date: '02/05/2026',
    total: 219000,
    items: [
      { title: 'Tuổi Trẻ Đáng Giá Bao Nhiêu', image: require('../assets/images/book4.jpg'), price: 49000, qty: 2 },
    ],
  },
  {
    id: 'BMC3341X',
    status: 'CANCELLED',
    date: '15/04/2026',
    total: 120000,
    items: [
      { title: 'Sapiens - Lược Sử Loài Người', image: require('../assets/images/book1.jpg'), price: 120000, qty: 1 },
    ],
  },
];

const TABS: { id: OrderStatus; label: string }[] = [
  { id: 'PENDING', label: 'Chờ xác nhận' },
  { id: 'DELIVERING', label: 'Đang giao' },
  { id: 'DELIVERED', label: 'Đã giao' },
  { id: 'CANCELLED', label: 'Đã hủy' },
];

const STATUS_CONFIG = {
  PENDING: { color: '#E5A72A', label: 'Chờ xác nhận', icon: 'time-outline' },
  DELIVERING: { color: '#1A56DB', label: 'Đang giao hàng', icon: 'bicycle-outline' },
  DELIVERED: { color: COLORS.primaryDark, label: 'Giao hàng thành công', icon: 'checkmark-circle-outline' },
  CANCELLED: { color: '#E53935', label: 'Đã hủy', icon: 'close-circle-outline' },
};

const fmt = (n: number) => n.toLocaleString('vi-VN') + 'đ';

// ─── Main Screen ─────────────────────────────────────────────────
export default function MyOrdersScreen() {
  const [activeTab, setActiveTab] = useState<OrderStatus>('PENDING');

  const filteredOrders = MOCK_ORDERS.filter(o => o.status === activeTab);

  const renderOrder = ({ item }: { item: Order }) => {
    const config = STATUS_CONFIG[item.status];
    const firstItem = item.items[0];
    const moreCount = item.items.length - 1;

    return (
      <TouchableOpacity 
        style={styles.orderCard}
        activeOpacity={0.7}
        onPress={() => router.push(`/order/${item.id}` as any)}
      >
        {/* Header: Status & Order ID */}
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
          <View style={styles.statusBadge}>
            <Ionicons name={config.icon as any} size={14} color={config.color} />
            <Text style={[styles.statusText, { color: config.color }]}>{config.label}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Body: Product Info */}
        <View style={styles.cardBody}>
          <Image source={firstItem.image} style={styles.productImg} contentFit="cover" />
          <View style={styles.productInfo}>
            <Text style={styles.productTitle} numberOfLines={2}>{firstItem.title}</Text>
            <View style={styles.productPriceRow}>
              <Text style={styles.productPrice}>{fmt(firstItem.price)}</Text>
              <Text style={styles.productQty}>x{firstItem.qty}</Text>
            </View>
          </View>
        </View>

        {moreCount > 0 && (
          <Text style={styles.moreItemsText}>
            Và {moreCount} sản phẩm khác...
          </Text>
        )}

        <View style={styles.divider} />

        {/* Footer: Total & Actions */}
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.dateText}>{item.date}</Text>
            <Text style={styles.totalText}>
              Tổng: <Text style={styles.totalAmount}>{fmt(item.total)}</Text>
            </Text>
          </View>
          
          <View style={styles.actionGroup}>
            {item.status === 'PENDING' && (
              <TouchableOpacity style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>Hủy đơn</Text>
              </TouchableOpacity>
            )}
            {item.status === 'DELIVERED' && (
              <TouchableOpacity style={styles.primaryBtn}>
                <Text style={styles.primaryBtnText}>Đánh giá</Text>
              </TouchableOpacity>
            )}
            {(item.status === 'CANCELLED' || item.status === 'DELIVERED') && (
              <TouchableOpacity style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>Mua lại</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn hàng của tôi</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* ── Tabs ── */}
      <View style={styles.tabContainer}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <TouchableOpacity 
              key={tab.id}
              style={[styles.tabBtn, isActive && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ── List ── */}
      <FlatList
        data={filteredOrders}
        keyExtractor={item => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={COLORS.divider} />
            <Text style={styles.emptyText}>Chưa có đơn hàng nào</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7F5', // Nền nhạt để làm nổi bật Card
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingTop: Platform.OS === 'ios' ? SPACING.sm : SPACING.xl,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  backBtn: {
    padding: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  tabTextActive: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHT.bold,
  },

  // List
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING['3xl'],
  },
  
  // Card
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    ...SHADOW.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 13,
    fontWeight: FONT_WEIGHT.semibold,
  },
  
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginVertical: SPACING.sm,
  },

  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productImg: {
    width: 60,
    height: 80,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.background,
  },
  productInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  productTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  productPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  productQty: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.semibold,
  },
  moreItemsText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.xs,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  totalText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  totalAmount: {
    fontSize: FONT_SIZE.base,
    color: COLORS.primaryDark,
    fontWeight: FONT_WEIGHT.bold,
  },
  
  actionGroup: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
  },
  primaryBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: FONT_WEIGHT.bold,
  },
  secondaryBtn: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  secondaryBtnText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: FONT_WEIGHT.medium,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.base,
    color: COLORS.textSecondary,
  }
});
