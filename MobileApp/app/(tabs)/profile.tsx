// PROFILE SCREEN — đồng bộ Design System
// ─────────────────────────────────────────────
// Tâm lý học áp dụng:
// • Endowment Effect  — hiển thị avatar + tên người dùng nổi bật → cảm giác "đây là của tôi"
// • Social Proof      — hiện số đơn hàng, điểm thưởng → củng cố hành vi mua tiếp
// • Peak-End Rule     — các action quan trọng (Đơn hàng, Yêu thích) đặt đầu
// • Loss Aversion     — "Đăng xuất" để cuối cùng, màu đỏ nhạt → người dùng ngần ngại nhấn
// ─────────────────────────────────────────────

import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { authService } from '@/services/authService';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS, SHADOW } from '@/constants/colors';

type MenuItem = {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  value?: string;
  danger?: boolean;
};

const MENU_GROUPS: { title: string; items: MenuItem[] }[] = [
  {
    title: 'Hoạt động',
    items: [
      { id: 'orders',   label: 'Đơn hàng của tôi',  icon: 'receipt-outline' },
      { id: 'wishlist', label: 'Sách yêu thích',     icon: 'heart-outline' },
      { id: 'reviews',  label: 'Đánh giá của tôi',   icon: 'star-outline' },
    ],
  },
  {
    title: 'Tài khoản',
    items: [
      { id: 'edit',     label: 'Chỉnh sửa hồ sơ',  icon: 'person-outline' },
      { id: 'password', label: 'Đổi mật khẩu',     icon: 'lock-closed-outline' },
      { id: 'address',  label: 'Địa chỉ giao hàng', icon: 'location-outline' },
    ],
  },
  {
    title: 'Hỗ trợ',
    items: [
      { id: 'support',  label: 'Trung tâm hỗ trợ',  icon: 'chatbubble-ellipses-outline' },
      { id: 'about',    label: 'Về BookMart',        icon: 'information-circle-outline' },
      { id: 'logout',   label: 'Đăng xuất',          icon: 'log-out-outline', danger: true },
    ],
  },
];

// ─── Component hàng menu ─────────────────────────────────────
function MenuItem({ item, onPress }: { item: MenuItem; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.menuIcon, item.danger && styles.menuIconDanger]}>
        <Ionicons
          name={item.icon}
          size={20}
          color={item.danger ? COLORS.error : COLORS.primary}
        />
      </View>
      <Text style={[styles.menuLabel, item.danger && styles.menuLabelDanger]}>
        {item.label}
      </Text>
      {!item.danger && (
        <Ionicons name="chevron-forward" size={16} color={COLORS.textHint} />
      )}
    </TouchableOpacity>
  );
}

// ─── Screen ──────────────────────────────────────────────────
export default function ProfileScreen() {
  const [user, setUser] = useState({
    name: 'Khách',
    email: '',
    avatar: '',
    avatarText: '?',
    orders: 0,
    wishlist: 0,
    points: 0,
  });

  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        try {
          // First use local data for fast UI rendering
          const userStr = await SecureStore.getItemAsync('user');
          if (userStr) {
            const parsedUser = JSON.parse(userStr);
            const fullName = parsedUser.full_name || parsedUser.username || 'Bạn';
            const initials = fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
            setUser({
              name: fullName,
              email: parsedUser.email || '',
              avatar: parsedUser.avatar_url || '',
              avatarText: initials,
              orders: parsedUser.order_count || parsedUser.orders || 0,
              wishlist: parsedUser.wishlist_count || parsedUser.wishlist || 0,
              points: parsedUser.loyalty_points || parsedUser.points || 0,
            });
          }
          
          // Then fetch real data from server
          const res = await authService.getMe();
          if (res.success && res.data) {
            const parsedUser = res.data;
            const fullName = parsedUser.full_name || parsedUser.username || 'Bạn';
            const initials = fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
            setUser({
              name: fullName,
              email: parsedUser.email || '',
              avatar: parsedUser.avatar_url || '',
              avatarText: initials,
              orders: parseInt(parsedUser.order_count) || parsedUser.orders || 0, // Fallback to 0 if not calculated yet
              wishlist: parseInt(parsedUser.wishlist_count) || parsedUser.wishlist || 0,
              points: parsedUser.loyalty_points || parsedUser.points || 0,
            });
          }
        } catch (e) {
          console.error('Error fetching user for profile:', e);
        }
      };
      
      fetchUser();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          style: 'destructive',
          onPress: async () => {
            await authService.logout();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ── HEADER / Avatar ── */}
        <View style={styles.profileCard}>
          {/* Avatar chữ tắt — Endowment Effect */}
          <View style={[styles.avatar, { padding: 0 }]}>
            <Image 
              source={{ uri: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&size=128` }} 
              style={{ width: '100%', height: '100%', borderRadius: 40 }} 
            />
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          {/* ── Stats — Social Proof ── */}
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statItem} onPress={() => router.push('/my-orders')}>
              <Text style={styles.statNum}>{user.orders}</Text>
              <Text style={styles.statLabel}>Đơn hàng</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statItem} onPress={() => router.push('/wishlist')}>
              <Text style={styles.statNum}>{user.wishlist}</Text>
              <Text style={styles.statLabel}>Yêu thích</Text>
            </TouchableOpacity>
            <View style={styles.statDivider} />
            <TouchableOpacity style={styles.statItem} onPress={() => router.push('/loyalty-points')}>
              <Text style={[styles.statNum, { color: COLORS.warning }]}>
                {user.points.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Điểm thưởng</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Menu nhóm ── */}
        {MENU_GROUPS.map((group) => (
          <View key={group.title} style={styles.menuCard}>
            <Text style={styles.menuGroupTitle}>{group.title}</Text>
            {group.items.map((item, idx) => (
              <View key={item.id}>
                <MenuItem 
                  item={item} 
                  onPress={() => {
                    if (item.id === 'orders') router.push('/my-orders');
                    else if (item.id === 'wishlist') router.push('/wishlist');
                    else if (item.id === 'reviews') router.push('/my-reviews');
                    else if (item.id === 'edit') router.push('/edit-profile');
                    else if (item.id === 'password') router.push('/change-password');
                    else if (item.id === 'support') router.push('/support');
                    else if (item.id === 'about') router.push('/about');
                    else if (item.id === 'address') router.push('/addresses');
                    else if (item.id === 'logout') handleLogout();
                    else Alert.alert('Thông báo', 'Tính năng đang được phát triển!');
                  }} 
                />
                {idx < group.items.length - 1 && <View style={styles.separator} />}
              </View>
            ))}
          </View>
        ))}

        <Text style={styles.version}>BookMart v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING['5xl'] - SPACING.md,
    paddingBottom: SPACING['3xl'],
  },

  // ── Profile card ──
  profileCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING['2xl'],
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOW.md,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  avatarText: {
    fontSize: FONT_SIZE['2xl'],
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.primaryDark,
  },
  userName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.text,
  },
  userEmail: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginTop: 3,
    marginBottom: SPACING.lg,
  },

  // ── Stats ──
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: COLORS.surfaceAlt,
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: {
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.extrabold,
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statDivider: { width: 1, backgroundColor: COLORS.border },

  // ── Menu card ──
  menuCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.md,
    ...SHADOW.sm,
  },
  menuGroupTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
    marginLeft: 2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  menuIcon: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIconDanger: { backgroundColor: '#FFEBEE' },
  menuLabel: {
    flex: 1,
    fontSize: FONT_SIZE.base,
    fontWeight: FONT_WEIGHT.medium,
    color: COLORS.text,
  },
  menuLabelDanger: { color: COLORS.error },
  separator: { height: 1, backgroundColor: COLORS.divider, marginLeft: 54 },

  // ── Version ──
  version: {
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    color: COLORS.textHint,
    marginTop: SPACING.md,
  },
});