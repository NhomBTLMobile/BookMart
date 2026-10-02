import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Easing,
  Platform,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import BookCard from '@/components/home/BookCard';
import SearchBar from '@/components/home/SearchBar';
import { COLORS } from '@/constants/colors';
import { homeService } from '@/services/homeService';
import { useCart } from '@/context/CartContext';

export default function SearchScreen() {
  const { q } = useLocalSearchParams<{ q: string }>();
  const [searchQuery, setSearchQuery] = useState(q || '');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const { addToCart: addContextCart, cartCount } = useCart();

  useEffect(() => {
    if (q) {
      setSearchQuery(q);
      fetchSearchResults(q, 1);
    } else {
      setLoading(false);
    }
  }, [q]);

  const fetchSearchResults = async (query: string, pageNum: number) => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    
    if (pageNum === 1) setLoading(true);
    
    try {
      const res = await homeService.searchBooks(query, pageNum, 10);
      if (res.success) {
        if (pageNum === 1) {
          setResults(res.data);
        } else {
          setResults(prev => [...prev, ...res.data]);
        }
        if (res.data.length < 10) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      } else {
        if (pageNum === 1) setResults([]);
        setHasMore(false);
      }
    } catch (error) {
      console.log('Error searching books', error);
      setHasMore(false);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setPage(1);
      router.setParams({ q: searchQuery.trim() });
      fetchSearchResults(searchQuery.trim(), 1);
    }
  };

  const loadMoreResults = () => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSearchResults(searchQuery, nextPage);
  };

  // ── Fly-to-cart animation ─────────────────────────────────
  const cartIconRef  = useRef<View>(null);
  const flyX         = useRef(new Animated.Value(0)).current;
  const flyY         = useRef(new Animated.Value(0)).current;
  const flyScale     = useRef(new Animated.Value(1)).current;
  const flyOpacity   = useRef(new Animated.Value(0)).current;
  const [flyingBook, setFlyingBook] = useState<{
    source: any; width: number; height: number;
  } | null>(null);

  const triggerFlyToCart = (bookNode: View | null, imageSource: any) => {
    if (!bookNode || !cartIconRef.current) return;

    bookNode.measure((_bx, _by, bw, bh, bpx, bpy) => {
      (cartIconRef.current as View).measure((_cx, _cy, cw, ch, cpx, cpy) => {
        flyX.setValue(bpx);
        flyY.setValue(bpy);
        flyScale.setValue(1);
        flyOpacity.setValue(1);
        setFlyingBook({ source: imageSource, width: bw, height: bh });

        const targetX = cpx + cw / 2 - bw / 2;
        const targetY = cpy + ch / 2 - bh / 2;

        Animated.parallel([
          Animated.timing(flyX, {
            toValue: targetX,
            duration: 900,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(flyY, {
            toValue: targetY,
            duration: 900,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(flyScale, {
            toValue: 0.12,
            duration: 900,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(650),
            Animated.timing(flyOpacity, {
              toValue: 0,
              duration: 250,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => setFlyingBook(null));
      });
    });
  };
  // ─────────────────────────────────────────────────────────

  const formatPrice = (price: string | number) => {
    const num = typeof price === 'string' ? parseInt(price) : price;
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  const getPlaceholderImage = (index: number) => {
    const placeholders = [
      require('../assets/images/book1.jpg'),
      require('../assets/images/book2.jpg'),
      require('../assets/images/book3.jpg'),
      require('../assets/images/book4.jpg'),
    ];
    return placeholders[index % placeholders.length];
  };

  const getImageSource = (book: any, index: number) => {
    return book.images && book.images.length > 0 ? { uri: book.images[0].image_url } : getPlaceholderImage(index);
  };

  const renderBookItem = ({ item, index }: { item: any, index: number }) => (
    <View style={styles.gridItem}>
      <BookCard
        style={styles.bookCardOverrides}
        image={getImageSource(item, index)}
        title={item.title}
        author={item.authors && item.authors.length > 0 ? item.authors.map((a: any) => a.name).join(', ') : 'Đang cập nhật'}
        price={formatPrice(item.sale_price)}
        rating={parseFloat(item.avg_rating) || 5.0}
        discount={parseFloat(item.original_price) > parseFloat(item.sale_price) ? `-${Math.round((1 - (parseFloat(item.sale_price) / parseFloat(item.original_price))) * 100)}%` : undefined}
        onPress={() => router.push(`/book/${item.id}`)}
        onAddToCart={() => addContextCart({
          id: item.id,
          title: item.title,
          author: item.authors && item.authors.length > 0 ? item.authors.map((a: any) => a.name).join(', ') : 'Đang cập nhật',
          price: item.sale_price,
          originalPrice: item.original_price,
          image: getImageSource(item, index),
          quantity: 1
        })}
        onCartPress={triggerFlyToCart}
      />
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 20 }} />;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={COLORS.text} />
          </TouchableOpacity>
          
          <View style={styles.searchContainer}>
            <SearchBar 
              value={searchQuery} 
              onChangeText={setSearchQuery} 
              onSubmitEditing={handleSearchSubmit}
            />
          </View>

          <TouchableOpacity
            ref={cartIconRef as any}
            style={styles.iconBtn}
            onPress={() => router.push('/(tabs)/cart')}
          >
            <Ionicons name="cart-outline" size={24} color={COLORS.text} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.resultsHeader}>
          <Text style={styles.resultsText}>
            {loading ? 'Đang tìm kiếm...' : `Kết quả tìm kiếm cho "${q || searchQuery}"`}
          </Text>
          {!loading && <Text style={styles.resultsCount}>{results.length} sách</Text>}
        </View>

        {loading ? (
          <View style={styles.centerLoading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={60} color={COLORS.textSecondary} style={{ opacity: 0.5 }} />
            <Text style={styles.emptyText}>Không tìm thấy cuốn sách nào phù hợp.</Text>
            <Text style={styles.emptySubtext}>Vui lòng thử lại bằng từ khóa khác!</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item, index) => `${item.id}_${index}`}
            renderItem={renderBookItem}
            numColumns={2}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={renderFooter()}
            onEndReached={loadMoreResults}
            onEndReachedThreshold={0.5}
            columnWrapperStyle={styles.columnWrapper}
          />
        )}

        {/* ── Ảnh sách đang bay về giỏ hàng ── */}
        {flyingBook && (
          <Animated.Image
            source={flyingBook.source}
            style={[
              styles.flyingImage,
              {
                width: flyingBook.width,
                height: flyingBook.height,
                opacity: flyOpacity,
                transform: [
                  { translateX: flyX },
                  { translateY: flyY },
                  { scale: flyScale },
                ],
              },
            ]}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  searchContainer: {
    flex: 1,
    marginRight: 12,
  },
  iconBtn: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#E53935',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.surface,
  },
  cartBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  resultsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  resultsCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 10,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 20,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: 20,
  },
  bookCardOverrides: {
    width: '100%',
    marginRight: 0,
  },
  loadingFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  flyingImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderRadius: 8,
    zIndex: 9999,
  },
});
