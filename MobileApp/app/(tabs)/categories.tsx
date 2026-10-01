// CATEGORIES SCREEN — đồng bộ Design System
// Màu đơn sắc: chỉ dùng brand xanh lá, 2 mức nền nhạt → không rối mắt

import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS, SHADOW } from '@/constants/colors';
import { homeService } from '@/services/homeService';

// ─── Types & Data ────────────────────────────────────────────
type Category = {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  bookCount: number;
  featured?: boolean;
};

// ─── CategoryGridItem ────────────────────────────────────────
function CategoryGridItem({ item, onPress }: { item: Category; onPress: () => void }) {
  return (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={onPress}
      activeOpacity={0.8}
    >
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await homeService.getCategories();
        if (res.success && res.data) {
          const formattedData = res.data.map((cat: any) => ({
            id: cat.id || Math.random().toString(),
            title: cat.name,
            icon: cat.icon_url || 'book-outline',
            bookCount: cat.book_count || 0,
            featured: cat.is_featured || false,
          }));
          setCategories(formattedData);
        }
      } catch (error) {
        console.log('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const filtered = search.trim()
    ? categories.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase())
      )
    : categories;

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
          <Text style={styles.headerSub}>Khám phá {categories.length} thể loại sách</Text>
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
        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
        ) : (
          <View>
            {search.trim().length > 0 && (
              <Text style={styles.resultLabel}>
                {filtered.length > 0
                  ? `Tìm thấy ${filtered.length} danh mục`
                  : 'Không tìm thấy danh mục phù hợp'}
              </Text>
            )}
            
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