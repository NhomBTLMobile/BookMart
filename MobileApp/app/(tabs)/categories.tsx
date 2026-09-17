import React, { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { COLORS } from '@/constants/colors';

// ─── Dữ liệu danh mục ────────────────────────────────────────────────────────
// Mỗi nhóm có màu riêng → Von Restorff Effect (tạo sự phân biệt rõ ràng)
// Số lượng nhóm nhỏ → Hick's Law (giảm thời gian quyết định)

type Category = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  bookCount: number;
  color: string;       // màu nền nhạt
  accent: string;      // màu đậm (icon, badge)
  featured?: boolean;  // Von Restorff: nổi bật hơn
};

type CategoryGroup = {
  groupId: string;
  groupName: string;
  items: Category[];
};

const CATEGORY_GROUPS: CategoryGroup[] = [
  // ── Nhóm phổ biến nhất (Cognitive Load: đặt lên đầu → ít phải tìm)
  {
    groupId: 'popular',
    groupName: '🔥 Phổ biến nhất',
    items: [
      { id: '1', title: 'Văn học', icon: 'book-outline', bookCount: 248, color: '#FFF3E0', accent: '#F57C00', featured: true },
      { id: '2', title: 'Kinh tế', icon: 'trending-up-outline', bookCount: 186, color: '#E8F5E9', accent: '#388E3C', featured: true },
      { id: '3', title: 'Kỹ năng sống', icon: 'bulb-outline', bookCount: 312, color: '#E3F2FD', accent: '#1976D2', featured: true },
      { id: '4', title: 'Thiếu nhi', icon: 'happy-outline', bookCount: 174, color: '#FCE4EC', accent: '#C2185B' },
    ],
  },
  // ── Học thuật & Nghề nghiệp (Gestalt Proximity: nhóm liên quan gần nhau)
  {
    groupId: 'academic',
    groupName: '🎓 Học thuật & Nghề nghiệp',
    items: [
      { id: '5', title: 'Sách giáo khoa', icon: 'school-outline', bookCount: 421, color: '#EDE7F6', accent: '#512DA8' },
      { id: '6', title: 'Công nghệ', icon: 'laptop-outline', bookCount: 137, color: '#E0F7FA', accent: '#00838F' },
      { id: '7', title: 'Khoa học', icon: 'flask-outline', bookCount: 98, color: '#F3E5F5', accent: '#7B1FA2' },
      { id: '8', title: 'Ngoại ngữ', icon: 'language-outline', bookCount: 203, color: '#E8EAF6', accent: '#3949AB' },
    ],
  },
  // ── Sức khỏe & Đời sống
  {
    groupId: 'lifestyle',
    groupName: '🌱 Sức khỏe & Đời sống',
    items: [
      { id: '9', title: 'Sức khỏe', icon: 'heart-outline', bookCount: 115, color: '#FFEBEE', accent: '#D32F2F' },
      { id: '10', title: 'Nấu ăn', icon: 'restaurant-outline', bookCount: 89, color: '#FFF8E1', accent: '#F9A825' },
      { id: '11', title: 'Du lịch', icon: 'airplane-outline', bookCount: 74, color: '#E0F2F1', accent: '#00695C' },
      { id: '12', title: 'Thể thao', icon: 'barbell-outline', bookCount: 62, color: '#FBE9E7', accent: '#BF360C' },
    ],
  },
  // ── Nghệ thuật & Giải trí
  {
    groupId: 'arts',
    groupName: '🎨 Nghệ thuật & Giải trí',
    items: [
      { id: '13', title: 'Truyện tranh', icon: 'images-outline', bookCount: 356, color: '#FFF9C4', accent: '#F57F17' },
      { id: '14', title: 'Âm nhạc', icon: 'musical-notes-outline', bookCount: 54, color: '#E8F5E9', accent: '#2E7D32' },
      { id: '15', title: 'Điện ảnh', icon: 'film-outline', bookCount: 43, color: '#FAFAFA', accent: '#424242' },
      { id: '16', title: 'Triết học', icon: 'telescope-outline', bookCount: 77, color: '#EDE7F6', accent: '#4527A0' },
    ],
  },
];

const ALL_CATEGORIES: Category[] = CATEGORY_GROUPS.flatMap((g) => g.items);

// ─── Component: thẻ danh mục trong lưới ──────────────────────────────────────
function CategoryGridItem({ item, onPress }: { item: Category; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={[styles.gridItem, { backgroundColor: item.color }]}
      onPress={onPress}
      activeOpacity={0.82}
    >
      {/* Von Restorff: badge "Hot" cho mục nổi bật */}
      {item.featured && (
        <View style={[styles.hotBadge, { backgroundColor: item.accent }]}>
          <Text style={styles.hotText}>Hot</Text>
        </View>
      )}

      <View style={[styles.iconWrap, { backgroundColor: item.accent + '22' }]}>
        <Ionicons name={item.icon} size={28} color={item.accent} />
      </View>

      <Text style={[styles.gridTitle, { color: item.accent }]} numberOfLines={1}>
        {item.title}
      </Text>

      <Text style={styles.gridCount}>{item.bookCount} cuốn</Text>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CategoriesScreen() {
  const [search, setSearch] = useState('');

  // Cognitive Load: lọc real-time → người dùng không cần nhớ vị trí danh mục
  const filtered = search.trim()
    ? ALL_CATEGORIES.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  const handleCategoryPress = (cat: Category) => {
    console.log('Danh mục:', cat.title);
    // router.push(`/category/${cat.id}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── HEADER ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Danh mục</Text>
          <Text style={styles.headerSub}>Khám phá {ALL_CATEGORIES.length} thể loại sách</Text>
        </View>

        {/* ── SEARCH BAR (Cognitive Load: tìm ngay, không cần scroll) ── */}
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm danh mục..."
            placeholderTextColor={COLORS.textSecondary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── KẾT QUẢ TÌM KIẾM ── */}
        {filtered ? (
          <View>
            <Text style={styles.resultLabel}>
              {filtered.length > 0
                ? `Tìm thấy ${filtered.length} danh mục`
                : 'Không tìm thấy danh mục phù hợp'}
            </Text>
            <View style={styles.grid}>
              {filtered.map((item) => (
                <CategoryGridItem
                  key={item.id}
                  item={item}
                  onPress={() => handleCategoryPress(item)}
                />
              ))}
            </View>
          </View>
        ) : (
          /* ── NHÓM DANH MỤC (Gestalt Proximity: nhóm theo chủ đề) ── */
          CATEGORY_GROUPS.map((group) => (
            <View key={group.groupId} style={styles.group}>
              {/* Header nhóm */}
              <View style={styles.groupHeader}>
                <Text style={styles.groupTitle}>{group.groupName}</Text>
                <TouchableOpacity onPress={() => console.log('Xem tất cả', group.groupName)}>
                  <Text style={styles.groupSeeAll}>Tất cả</Text>
                </TouchableOpacity>
              </View>

              {/* Lưới 2 cột (Hick's Law: 4 ô / nhóm = dễ quét mắt) */}
              <View style={styles.grid}>
                {group.items.map((item) => (
                  <CategoryGridItem
                    key={item.id}
                    item={item}
                    onPress={() => handleCategoryPress(item)}
                  />
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_GAP = 12;
const CARD_SIZE = '48%';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 36,
  },

  // ── Header ──
  header: {
    marginBottom: 18,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
  },
  headerSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 3,
  },

  // ── Search ──
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 22,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
  },

  // ── Kết quả tìm kiếm ──
  resultLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },

  // ── Nhóm ──
  group: {
    marginBottom: 24,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  groupSeeAll: {
    fontSize: 13,
    color: COLORS.primaryDark,
    fontWeight: '600',
  },

  // ── Lưới 2 cột ──
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },

  // ── Thẻ danh mục ──
  gridItem: {
    width: CARD_SIZE,
    borderRadius: 16,
    padding: 16,
    // Shadow
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
  },
  hotBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  hotText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 3,
  },
  gridCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});