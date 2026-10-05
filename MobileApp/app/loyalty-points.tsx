import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Platform,
  FlatList,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SHADOW, SPACING } from '../constants/colors';
import { api } from '../services/api';
import { authService } from '../services/authService';

export default function LoyaltyPointsScreen() {
  const [points, setPoints] = useState(0);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const userStr = await SecureStore.getItemAsync('user');
      let userId = '';
      if (userStr) {
        const parsed = JSON.parse(userStr);
        userId = parsed.id;
        setPoints(parsed.loyalty_points || parsed.points || 0);
      }

      // Fetch fresh user data
      const meRes = await authService.getMe();
      if (meRes.success && meRes.data) {
        setPoints(meRes.data.loyalty_points || 0);
        userId = meRes.data.id;
      }

      // Fetch ledger history
      if (userId) {
        const ledgerRes = await api.get(`/loyalty_points_ledger?user_id=${userId}&limit=50&sort=created_at&order=DESC`);
        setHistory(ledgerRes.data.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const renderItem = ({ item }: { item: any }) => {
    const isPositive = item.delta > 0;
    
    let iconName: keyof typeof Ionicons.glyphMap = 'star';
    let title = 'Nhận điểm thưởng';
    
    const type = (item.type || '').toLowerCase();
    
    if (type === 'earn_order') {
      iconName = 'add-circle';
      title = 'Điểm từ đơn hàng';
    } else if (type === 'earn_review') {
      iconName = 'add-circle';
      title = 'Đánh giá sản phẩm';
    } else if (type.includes('redeem')) {
      iconName = 'remove-circle';
      title = type === 'redeem_voucher' ? 'Đổi Voucher' : 'Dùng điểm thanh toán';
    } else if (type.includes('refund')) {
      iconName = 'refresh-circle';
      title = 'Hoàn điểm đơn hủy';
    }

    return (
      <View style={styles.historyCard}>
        <View style={styles.historyLeft}>
          <View style={[styles.iconBox, { backgroundColor: isPositive ? COLORS.success + '15' : COLORS.error + '15' }]}>
            <Ionicons name={iconName} size={24} color={isPositive ? COLORS.success : COLORS.error} />
          </View>
          <View>
            <Text style={styles.historyTitle}>{title}</Text>
            <Text style={styles.historyDate}>
              {new Date(item.created_at).toLocaleString('vi-VN', {
                hour: '2-digit', minute: '2-digit', 
                day: '2-digit', month: '2-digit', year: 'numeric'
              })}
            </Text>
          </View>
        </View>
        <Text style={[styles.historyDelta, { color: isPositive ? COLORS.success : COLORS.text }]}>
          {isPositive ? '+' : ''}{item.delta}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Điểm thưởng</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.pointsBanner}>
        <Ionicons name="star" size={48} color={COLORS.warning} style={{ marginBottom: SPACING.sm }} />
        <Text style={styles.pointsLabel}>Điểm hiện tại của bạn</Text>
        <Text style={styles.pointsValue}>{points.toLocaleString()}</Text>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={24} color={COLORS.primary} />
        <Text style={styles.infoText}>
          Bạn có thể sử dụng Điểm thưởng trực tiếp tại bước Thanh toán để được giảm giá (1 Điểm = 1 VNĐ).
        </Text>
      </View>

      <View style={styles.listContainer}>
        <Text style={styles.sectionTitle}>Lịch sử điểm thưởng</Text>
        
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="time-outline" size={48} color={COLORS.divider} />
                <Text style={styles.emptyText}>Chưa có lịch sử điểm thưởng nào</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7F5' },
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
  backBtn: { padding: SPACING.xs },
  headerTitle: { fontSize: FONT_SIZE.lg, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  
  pointsBanner: {
    backgroundColor: COLORS.primaryDark,
    padding: SPACING['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    margin: SPACING.lg,
    borderRadius: RADIUS.xl,
    ...SHADOW.md,
  },
  pointsLabel: {
    color: COLORS.white,
    opacity: 0.9,
    fontSize: FONT_SIZE.base,
    marginBottom: 4,
  },
  pointsValue: {
    color: COLORS.warning,
    fontSize: 42,
    fontWeight: FONT_WEIGHT.extrabold,
  },

  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.primaryLight,
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  infoText: {
    flex: 1,
    color: COLORS.primaryDark,
    fontSize: FONT_SIZE.sm,
    lineHeight: 20,
  },

  listContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingTop: SPACING.lg,
    ...SHADOW.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING['4xl'],
  },
  center: { padding: SPACING.xl, alignItems: 'center' },
  
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyTitle: {
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.semibold,
    color: COLORS.text,
    marginBottom: 4,
  },
  historyDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  historyDelta: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },

  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyText: { marginTop: SPACING.md, color: COLORS.textSecondary },
});
