import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING, RADIUS, SHADOW } from '@/constants/colors';
import { wishlistService } from '@/services/wishlistService';
import BookCard from '@/components/home/BookCard';

export default function WishlistScreen() {
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      const res = await wishlistService.getMyWishlist();
      if (res.success && res.data) {
        setWishlist(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchWishlist();
    }, [])
  );

  const handleRemove = async (bookId: string) => {
    // Optimistic UI update
    setWishlist(prev => prev.filter(b => b.id !== bookId));
    await wishlistService.toggleWishlist(bookId);
  };

  const formatPrice = (price: string | number) => {
    if (!price) return '0đ';
    const num = typeof price === 'string' ? parseInt(price) : price;
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sách yêu thích</Text>
        <View style={{ width: 26 }} />
      </View>

      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : wishlist.length > 0 ? (
        <FlatList
          data={wishlist}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <View style={styles.gridItem}>
              <BookCard
                style={styles.bookCardOverrides}
                image={item.image_url ? { uri: item.image_url } : require('@/assets/images/book1.jpg')}
                title={item.title}
                author={item.authors && item.authors.length > 0 ? item.authors.map((a: any) => a?.name).filter(Boolean).join(', ') : 'Đang cập nhật'}
                price={formatPrice(item.sale_price)}
                originalPrice={parseFloat(item.original_price) > parseFloat(item.sale_price) ? formatPrice(item.original_price) : undefined}
                rating={parseFloat(item.avg_rating) || 5.0}
                discount={parseFloat(item.original_price) > parseFloat(item.sale_price) ? `-${Math.round((1 - (parseFloat(item.sale_price) / parseFloat(item.original_price))) * 100)}%` : undefined}
                onPress={() => router.push(`/book/${item.id}`)}
                onAddToCart={() => console.log('Add to cart from wishlist')}
              />
              <TouchableOpacity 
                style={styles.removeBtn} 
                onPress={() => handleRemove(item.id)}
                activeOpacity={0.8}
              >
                <Ionicons name="heart" size={20} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={60} color={COLORS.textHint} />
          <Text style={styles.emptyText}>Bạn chưa thêm sách nào vào danh sách yêu thích.</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(tabs)')}>
            <Text style={styles.shopBtnText}>Khám phá ngay</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { padding: SPACING.xs, marginLeft: -SPACING.xs },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
  },
  centerLoading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20, paddingBottom: 40 },
  columnWrapper: { justifyContent: 'space-between' },
  gridItem: { width: '48%', marginBottom: 20, position: 'relative' },
  bookCardOverrides: { width: '100%', marginRight: 0 },
  removeBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.sm,
  },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  emptyText: { marginTop: 16, fontSize: 16, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24, lineHeight: 24 },
  shopBtn: { backgroundColor: COLORS.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  shopBtnText: { color: COLORS.white, fontSize: 16, fontWeight: 'bold' },
});
