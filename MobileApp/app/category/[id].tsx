import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';

import BookCard from '@/components/home/BookCard';
import { COLORS, FONT_SIZE, FONT_WEIGHT, SPACING } from '@/constants/colors';
import { useCart } from '@/context/CartContext';
import { homeService } from '@/services/homeService';

export default function CategoryDetailsScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  
  const [books, setBooks] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchFirstPage = async () => {
      setLoading(true);
      try {
        const res = await homeService.getBooksByCategory(id as string, 1, 10);
        if (res.success && res.data) {
          setBooks(res.data);
          setTotalCount(res.meta?.total || res.data.length);
          if (res.data.length < 10) setHasMore(false);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchFirstPage();
  }, [id]);

  const loadMoreBooks = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const res = await homeService.getBooksByCategory(id as string, nextPage, 10);
      if (res.success && res.data.length > 0) {
        setBooks((prev) => [...prev, ...res.data]);
        setPage(nextPage);
        if (res.data.length < 10) setHasMore(false);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.log('Error loading more books', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const formatPrice = (price: any) => {
    if (!price) return '0đ';
    const num = typeof price === 'string' ? parseInt(price) : price;
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  const getPlaceholderImage = (index: number) => {
    const placeholders = [
      require('../../assets/images/book1.jpg'),
      require('../../assets/images/book2.jpg'),
      require('../../assets/images/book3.jpg'),
      require('../../assets/images/book4.jpg'),
    ];
    return placeholders[index % placeholders.length];
  };

  const getImageSource = (book: any, index: number) => {
    return book.images && book.images.length > 0
      ? { uri: book.images[0].image_url }
      : getPlaceholderImage(index);
  };

  // ── Fly-to-cart animation ─────────────────────────────────
  const cartIconRef = useRef<View>(null);
  const flyX = useRef(new Animated.Value(0)).current;
  const flyY = useRef(new Animated.Value(0)).current;
  const flyScale = useRef(new Animated.Value(1)).current;
  const flyOpacity = useRef(new Animated.Value(0)).current;
  const [flyingBook, setFlyingBook] = useState<{
    source: any;
    width: number;
    height: number;
  } | null>(null);

  const triggerFlyToCart = (bookNode: View | null, imageSource: any) => {
    // Add item to actual cart immediately
    if (!bookNode || !cartIconRef.current) return;
    
    // Animate
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

  const renderBookItem = ({ item, index }: { item: any; index: number }) => {
    const authorName = item.authors && item.authors.length > 0 
      ? item.authors.map((a: any) => a.name).join(', ') 
      : 'Đang cập nhật';
    
    return (
      <View style={styles.gridItem}>
        <BookCard
          style={styles.bookCardOverrides}
          image={getImageSource(item, index)}
          title={item.title}
          author={authorName}
          price={formatPrice(item.sale_price)}
          originalPrice={
            parseFloat(item.original_price) > parseFloat(item.sale_price)
              ? formatPrice(item.original_price)
              : undefined
          }
          rating={parseFloat(item.avg_rating) || 5.0}
          discount={
            parseFloat(item.original_price) > parseFloat(item.sale_price)
              ? `-${Math.round((1 - parseFloat(item.sale_price) / parseFloat(item.original_price)) * 100)}%`
              : undefined
          }
          onPress={() => router.push(`/book/${item.id}`)}
          onAddToCart={() => {
            addToCart({
              id: item.id,
              title: item.title,
              author: authorName,
              price: item.sale_price,
              originalPrice: item.original_price,
              image: getImageSource(item, index),
              quantity: 1,
            });
          }}
          onCartPress={triggerFlyToCart}
        />
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return <View style={{ height: 40 }} />;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={26} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {name || 'Danh mục'}
        </Text>
        <TouchableOpacity 
          style={styles.cartBtn}
          ref={cartIconRef as any}
          onPress={() => router.push('/(tabs)/cart')}
        >
          <Ionicons name="cart-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.metaRow}>
        <Text style={styles.resultText}>
          {loading ? 'Đang tải...' : `Có ${totalCount} sản phẩm`}
        </Text>
      </View>

      {/* CONTENT */}
      {loading ? (
        <View style={styles.centerLoading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : books.length > 0 ? (
        <FlatList
          data={books}
          keyExtractor={(item, index) => `${item.id}_${index}`}
          renderItem={renderBookItem}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreBooks}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="folder-open-outline" size={60} color={COLORS.textHint} />
          <Text style={styles.emptyText}>Chưa có sách nào trong danh mục này.</Text>
        </View>
      )}

      {/* FLYING BOOK ANIMATION */}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
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
  backBtn: {
    padding: SPACING.xs,
    marginLeft: -SPACING.xs,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
    color: COLORS.text,
    marginHorizontal: SPACING.md,
  },
  cartBtn: {
    padding: SPACING.xs,
    marginRight: -SPACING.xs,
  },
  metaRow: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.background,
  },
  resultText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: FONT_WEIGHT.medium,
  },
  centerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING['3xl'],
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    marginBottom: SPACING.xl,
  },
  bookCardOverrides: {
    width: '100%',
    marginRight: 0,
  },
  loadingFooter: {
    paddingVertical: SPACING.lg,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING['2xl'],
  },
  emptyText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  flyingImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 9999,
    borderRadius: 6,
    resizeMode: 'cover',
  },
});
