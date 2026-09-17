// CATEGORIES SCREEN — đồng bộ Design System
// Màu đơn sắc: chỉ dùng brand xanh lá, 2 mức nền nhạt → không rối mắt

import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS, SHADOW } from '@/constants/colors';

// ─── Types & Data ────────────────────────────────────────────
type Category = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  bookCount: number;
  featured?: boolean;
};

type CategoryGroup = {
  groupId: string;
  groupName: string;
  items: Category[];
};

const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    groupId: 'popular',
    groupName: '🔥 Phổ biến nhất',
    items: [
      { id: '1',  title: 'Văn học',      icon: 'book-outline',        bookCount: 248, featured: true },
      { id: '2',  title: 'Kinh tế',      icon: 'trending-up-outline', bookCount: 186, featured: true },
      { id: '3',  title: 'Kỹ năng sống', icon: 'bulb-outline',        bookCount: 312, featured: true },
      { id: '4',  title: 'Thiếu nhi',    icon: 'happy-outline',       bookCount: 174 },
    ],
  },
  {
    groupId: 'academic',
    groupName: '🎓 Học thuật & Nghề nghiệp',
    items: [
      { id: '5',  title: 'Sách giáo khoa', icon: 'school-outline',   bookCount: 421 },
      { id: '6',  title: 'Công nghệ',      icon: 'laptop-outline',   bookCount: 137 },
      { id: '7',  title: 'Khoa học',       icon: 'flask-outline',    bookCount: 98  },
      { id: '8',  title: 'Ngoại ngữ',      icon: 'language-outline', bookCount: 203 },
    ],
  },
  {
    groupId: 'lifestyle',
    groupName: '🌱 Sức khỏe & Đời sống',
    items: [
      { id: '9',  title: 'Sức khỏe', icon: 'heart-outline',      bookCount: 115 },
      { id: '10', title: 'Nấu ăn',   icon: 'restaurant-outline', bookCount: 89  },
      { id: '11', title: 'Du lịch',  icon: 'airplane-outline',   bookCount: 74  },
      { id: '12', title: 'Thể thao', icon: 'barbell-outline',    bookCount: 62  },
    ],
  },
  {
    groupId: 'arts',
    groupName: '🎨 Nghệ thuật & Giải trí',
    items: [
      { id: '13', title: 'Truyện tranh', icon: 'images-outline',        bookCount: 356 },
      { id: '14', title: 'Âm nhạc',      icon: 'musical-notes-outline', bookCount: 54  },
      { id: '15', title: 'Điện ảnh',     icon: 'film-outline',          bookCount: 43  },
      { id: '16', title: 'Triết học',    icon: 'telescope-outline',     bookCount: 77  },
    ],
  },
];

const ALL_CATEGORIES = CATEGORY_GROUPS.flatMap((g) => g.items);

// ─── CategoryGridItem ────────────────────────────────────────
function CategoryGridItem({ item, onPress }: { item: Category; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Von Restorff Effect — badge Hot chỉ cho mục nổi bật */}
      {item.featured && (
        <View style={styles.hotBadge}>
          <Text style={styles.hotText}>Hot</Text>
        </View>
      )}

      <View style={styles.iconWrap}>
        <Ionicons name={item.icon} size={26} color={COLORS.primary} />
      </View>

      <Text style={styles.gridTitle} numberOfLines={1}>
        {item.title}
      </Text>
      <Text style={styles.gridCount}>{item.bookCount} cuốn</Text>
    </TouchableOpacity>
  );
}

// ─── Screen ──────────────────────────────────────────────────
export default function CategoriesScreen() {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? ALL_CATEGORIES.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase())
      )
    : null;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Danh mục</Text>
          <Text style={styles.headerSub}>Khám phá {ALL_CATEGORIES.length} thể loại sách</Text>
        </View>

        {/* ── Search (Cognitive Load Reduction) ── */}
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={17} color={COLORS.textHint} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm danh mục..."
            placeholderTextColor={COLORS.textHint}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={17} color={COLORS.textHint} />
            </TouchableOpacity>
          )}
        </View>

        {/* ── Nội dung ── */}
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
                  onPress={() => console.log(item.title)}
                />
              ))}
            </View>
          </View>
        ) : (
          CATEGORY_GROUPS.map((group) => (
            <View key={group.groupId} style={styles.group}>
              <View style={styles.groupHeader}>
                <Text style={styles.groupTitle}>{group.groupName}</Text>
                <TouchableOpacity>
                  <Text style={styles.groupSeeAll}>Tất cả</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.grid}>
                {group.items.map((item) => (
                  <CategoryGridItem
                    key={item.id}
                    item={item}
                    onPress={() => console.log(item.title)}
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING['5xl'] - SPACING.md,
    paddingBottom: SPACING['3xl'],
  },

  header: { marginBottom: SPACING.lg },
  headerTitle: { fontSize: FONT_SIZE['2xl'], fontWeight: FONT_WEIGHT.extrabold, color: COLORS.text },
  headerSub: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 3 },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.lg,
    height: 48,
    marginBottom: SPACING['2xl'],
    gap: SPACING.md,
    ...SHADOW.sm,
  },
  searchInput: { flex: 1, fontSize: FONT_SIZE.md, color: COLORS.text },

  resultLabel: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginBottom: SPACING.md },

  group: { marginBottom: SPACING['2xl'] },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  groupTitle: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, color: COLORS.text },
  groupSeeAll: { fontSize: FONT_SIZE.sm, fontWeight: FONT_WEIGHT.semibold, color: COLORS.primaryDark },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },

  gridItem: {
    width: '47.5%',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.primaryLight,
    ...SHADOW.sm,
  },
  hotBadge: {
    position: 'absolute', top: 10, right: 10,
    borderRadius: RADIUS.sm - 2,
    paddingHorizontal: 7, paddingVertical: 2,
    backgroundColor: COLORS.primaryDark,
  },
  hotText: { fontSize: 10, fontWeight: FONT_WEIGHT.bold, color: COLORS.white },

  iconWrap: {
    width: 46, height: 46,
    borderRadius: RADIUS.md,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: SPACING.md,
    backgroundColor: COLORS.white,
  },
  gridTitle: { fontSize: FONT_SIZE.md, fontWeight: FONT_WEIGHT.bold, marginBottom: 3, color: COLORS.text },
  gridCount: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
});