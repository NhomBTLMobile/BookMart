// PROFILE SCREEN — đồng bộ Design System
// ─────────────────────────────────────────────
// Tâm lý học áp dụng:
// • Endowment Effect  — hiển thị avatar + tên người dùng nổi bật → cảm giác "đây là của tôi"
// • Social Proof      — hiện số đơn hàng, điểm thưởng → củng cố hành vi mua tiếp
// • Peak-End Rule     — các action quan trọng (Đơn hàng, Yêu thích) đặt đầu
// • Loss Aversion     — "Đăng xuất" để cuối cùng, màu đỏ nhạt → người dùng ngần ngại nhấn
// ─────────────────────────────────────────────

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS, SHADOW } from '@/constants/colors';

// ─── Dữ liệu mock ────────────────────────────────────────────
const USER = {
  name: 'Thanh Đào',
  email: 'thanhdao@gmail.com',
  avatar: 'TD',   // chữ tắt, dùng nếu chưa có ảnh thật
  orders: 12,
  wishlist: 28,
  points: 1_450,
};

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
      { id: 'address',  label: 'Địa chỉ giao hàng', icon: 'location-outline' },
      { id: 'payment',  label: 'Phương thức thanh toán', icon: 'card-outline' },
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
  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ── HEADER / Avatar ── */}
        <View style={styles.profileCard}>
          {/* Avatar chữ tắt — Endowment Effect */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{USER.avatar}</Text>
          </View>
          <Text style={styles.userName}>{USER.name}</Text>
          <Text style={styles.userEmail}>{USER.email}</Text>

          {/* ── Stats — Social Proof ── */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{USER.orders}</Text>
              <Text style={styles.statLabel}>Đơn hàng</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{USER.wishlist}</Text>
              <Text style={styles.statLabel}>Yêu thích</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: COLORS.warning }]}>
                {USER.points.toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Điểm thưởng</Text>
            </View>
          </View>
        </View>

        {/* ── Menu nhóm ── */}
        {MENU_GROUPS.map((group) => (
          <View key={group.title} style={styles.menuCard}>
            <Text style={styles.menuGroupTitle}>{group.title}</Text>
            {group.items.map((item, idx) => (
              <View key={item.id}>
                <MenuItem item={item} onPress={() => console.log(item.id)} />
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